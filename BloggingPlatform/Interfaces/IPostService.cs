using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface IPostService
    {
        public Task<Post> AddPost(Post post, Guid userId);
        public Task<Post> GetPostByID(Guid id);
        public Task<Post> UpdatePost(Guid id, Guid userId, Post post, List<IFormFile> newImages);
        public Task<IEnumerable<Comment>> GetCommentSByPost(Guid id);
        public Task<Post> DeletePost(Guid id, Guid userId);
        public Task<List<Image>> GetImagesByPostId(Guid id);
        public Task<IEnumerable<Post>> GetFilteredPosts(Guid? userId, string? status, string? searchTerm, string? sortOrder, int? pageNumber, int? pageSize);
        public Task<IEnumerable<Post>> GetAllPosts();
        public Task<IEnumerable<Like>> GetLikesByPostId(Guid id);

    }
}
