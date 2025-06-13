using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces;

public interface IPostRepository
{
    Task<Post> GetByIdAsync(Guid id);
    Task<IEnumerable<Post>> GetByAuthorIdAsync(Guid authorId);
    Task<Post> CreateAsync(Post post);
    Task<Post> UpdateAsync(Post post);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, PostStatus status);
    Task<bool> UpdateModerationStatusAsync(Guid id, ModerationStatus status);
    Task<IEnumerable<Post>> GetPublishedPostsAsync(int page, int pageSize);
} 