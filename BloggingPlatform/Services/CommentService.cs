using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using Microsoft.OpenApi.Extensions;
using System.Text.Json;

namespace BloggingPlatform.Services
{
    public class CommentService : ICommentService
    {
        private readonly IRepository<Guid, Comment> _commentRepo;
        private readonly IUserValidationService _userValidationService;

        public CommentService(IRepository<Guid, Comment> commentRepo, IUserValidationService userValidationService)
        {
            _commentRepo = commentRepo;
            _userValidationService = userValidationService;
                    }

        public async Task<Comment> AddComment(Comment comment, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);
            var added = await _commentRepo.Add(comment);
            return added;
        }
        public async Task<Comment> GetCommentById(Guid id)
        {
            var comment = await _commentRepo.Get(id);

            if (comment == null || comment.IsDeleted)
                throw new Exception("Comment not found");

            return comment;
        }


        public async Task<Comment> UpdateComment(Guid id, Comment comment, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);

            var existing = await _commentRepo.Get(id);

            existing.Content = comment.Content;
            existing.Status = comment.Status;
            var updated = await _commentRepo.Update(id, existing);

            

            return updated;
        }

        public async Task<Comment> DeleteComment(Guid id, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);

            var comment = await _commentRepo.Get(id);

            if (comment == null)
                throw new Exception("Comment not found");

            if (comment.IsDeleted ==true)
                return comment;

            comment.Status = "Rejected";
            comment.IsDeleted = true;
            await _commentRepo.Update(id, comment);

            return comment;
        }
        public async Task<IEnumerable<Comment>> GetFilteredComments(Guid? postId,Guid? userId, string? status, string? sortOrder, int? pageNumber, int? pageSize)
                {

                    var comments = await _commentRepo.GetAll();

                    var query = comments
                        .Where(c => !c.IsDeleted)
                        .AsQueryable();
                        if (postId.HasValue)
                            query = query.Where(c => c.PostId == postId.Value);

                    if (userId.HasValue && userId != Guid.Empty)
                    {
                        await _userValidationService.ValidateUser(userId.Value);
                        query = query.Where(c => c.UserId == userId.Value);
                    }
                    if (!string.IsNullOrWhiteSpace(status))
                    {
                        query = query.Where(c => !string.IsNullOrEmpty(c.Status) &&
                                                c.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
                    }

                    query = sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(c => c.CreatedAt)
                        : query.OrderBy(c => c.CreatedAt);

                    if (pageNumber.HasValue && pageSize.HasValue)
                        query = query.Skip((pageNumber.Value - 1) * pageSize.Value).Take(pageSize.Value);

                    return query.ToList();
                }

    }
}
