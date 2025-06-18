using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

namespace BloggingPlatform.Interfaces
{
    public interface ICommentService
    {
        public Task<Comment> AddComment(Comment comment, Guid userId);
        public Task<Comment> UpdateComment(Guid id, Comment comment, Guid userId);
        public Task<Comment> DeleteComment(Guid id, Guid userId);
        public Task<IEnumerable<Comment>> GetFilteredComments(Guid? postId, Guid? userId, string? status, string? sortOrder, int? pageNumber, int? pageSize);
        public Task<Comment> GetCommentById(Guid id);

    }
}
