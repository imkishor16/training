using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces;

public interface ICommentRepository
{
    Task<Comment> GetByIdAsync(Guid id);
    Task<IEnumerable<Comment>> GetByPostIdAsync(Guid postId);
    Task<IEnumerable<Comment>> GetByAuthorIdAsync(Guid authorId);

    Task<Comment> CreateAsync(Comment comment);
    Task<Comment> UpdateAsync(Comment comment);
    Task<bool> DeleteAsync(Guid id);

} 