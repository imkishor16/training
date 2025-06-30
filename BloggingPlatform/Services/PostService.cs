using BloggingPlatform.Contexts;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using Microsoft.AspNetCore.SignalR;
using BloggingPlatform.Hubs;
using System.Text.Json;
using Microsoft.OpenApi.Extensions;
using BloggingPlatform.Repositories;

namespace BloggingPlatform.Services
{
    public class PostService : IPostService
    {
        private readonly IRepository<Guid, Post> _postRepository;
        private readonly IRepository<Guid, Comment> _commentRepository;
        private readonly IRepository<Guid, Like> _likeRepository;
        private readonly IRepository<Guid, Image> _imagerepository;
        private readonly IImageService _imageService;
        private readonly BloggingPlatformContext _context;
        private readonly IRepository<Guid, User> _userRepository;
        private readonly IUserValidationService _userValidationService;



        public PostService(IRepository<Guid, Post> postRepo, IRepository<Guid, Comment> commentRepository
        , IRepository<Guid, Image> imagerepository, IRepository<Guid, User> userRepository, IRepository<Guid, Like> likeRepository,
IImageService imageService, BloggingPlatformContext context,IUserValidationService userValidationService)
        {
            _postRepository = postRepo;
            _commentRepository = commentRepository;
            _likeRepository = likeRepository;
            _imagerepository = imagerepository;
            _imageService = imageService;
            _context = context;
            _userRepository = userRepository;
                _userValidationService = userValidationService;

        }


        public async Task<Post> AddPost(Post post, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);
            post.UserId = userId;
            await _userValidationService.ValidateUser(post.UserId);
            var created = await _postRepository.Add(post);
            return created;
        }

        public async Task<Post> UpdatePost(Guid id, Guid userId, Post updatedPost, List<IFormFile> newImages)
        {
            await _userValidationService.ValidateUser(userId);

            var old = await _postRepository.Get(id);
            if (old == null)
                throw new Exception("Post not found.");

            if (!string.IsNullOrWhiteSpace(updatedPost.Title))
                old.Title = updatedPost.Title;

            if (!string.IsNullOrWhiteSpace(updatedPost.Content))
                old.Content = updatedPost.Content;

            
            if (!string.IsNullOrWhiteSpace(updatedPost.PostStatus))
                old.PostStatus = updatedPost.PostStatus;


            await _context.SaveChangesAsync(); 

            // Update images only if provided
            if (newImages != null && newImages.Count > 0)
            {
                old.Images = await _imageService.UpdateImagesAsync(newImages, id, userId);
            }

            return old;
        }

        public async Task<Post> DeletePost(Guid id, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);

            var post = await _postRepository.Get(id);

            if (post == null)
                throw new Exception("No post found with the given ID.");

            if (post.IsDeleted)
                throw new Exception("Post is already deleted.");

            post.IsDeleted = true;
            await _imageService.DeleteImagesByPostIdAsync(id, userId);

            await _postRepository.Update(id, post);

            return post;
        }

        public async Task<Post> GetPostByID(Guid id) => await _postRepository.Get(id);
        public async Task<IEnumerable<Post>> GetAllPosts()
        {
            var posts = await _postRepository.GetAll();
            var final = posts.Where(p => !p.IsDeleted).ToList();
            return final;
        }

        public async Task<IEnumerable<Comment>> GetCommentSByPost(Guid id)
        {
            var comments = await _commentRepository.GetAll();
            var final = comments.Where(c => c.PostId == id).ToList();
            return final;
        }
        public async Task<List<Image>> GetImagesByPostId(Guid id)
        {
            var images = await _imagerepository.GetAll();
            var final = images.Where(c => c.PostId == id).ToList();
            return final;
        }
        public async Task<IEnumerable<Post>> GetFilteredPosts(
            Guid? userId,
            string? status,
            string? searchTerm,
            string? sortOrder,
            int? pageNumber,
            int? pageSize)
        {
            var posts = await _postRepository.GetAll(); // consider using IQueryable from repo if possible

            var query = posts
                .Where(p => !p.IsDeleted)
                .AsQueryable();

            if (userId.HasValue && userId.Value != Guid.Empty)
            {
                await _userValidationService.ValidateUser(userId.Value);
                query = query.Where(p => p.UserId == userId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(p =>
                    !string.IsNullOrEmpty(p.PostStatus) &&
                    p.PostStatus.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(p =>
                    (!string.IsNullOrEmpty(p.Title) && p.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(p.Content) && p.Content.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));
            }

            query = sortOrder?.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Id)
                : query.OrderBy(p => p.Id);

            if (pageNumber.HasValue && pageSize.HasValue)
            {
                query = query.Skip((pageNumber.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            return query.ToList();
        }

        public async Task<IEnumerable<Like>> GetLikesByPostId(Guid id)
        {
            var likes = await _likeRepository.GetAll();
            var final = likes.Where(l => l.PostId == id).ToList();
            return final;
        }

        public async Task<IEnumerable<Post>> GetPostsByUserId(Guid userId)
        {
            await _userValidationService.ValidateUser(userId);
            return await ((PostRepository)_postRepository).GetPostsByUserId(userId);
        }

        public async Task<IEnumerable<Post>> GetUserLikedPosts(Guid userId)
        {
            await _userValidationService.ValidateUser(userId);
            return await ((PostRepository)_postRepository).GetUserLikedPosts(userId);
        }

        public async Task<IEnumerable<Post>> GetUserCommentedPosts(Guid userId)
        {
            await _userValidationService.ValidateUser(userId);
            return await ((PostRepository)_postRepository).GetUserCommentedPosts(userId);
        }
    }
}
