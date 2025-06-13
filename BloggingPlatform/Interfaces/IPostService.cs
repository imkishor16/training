using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;
using BloggingPlatform.Dto.Post;

namespace BloggingPlatform.Interfaces;

public interface IPostService
{
    Task<PostResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<PostResponseDto>> GetByAuthorIdAsync(Guid authorId);
    Task<PostResponseDto> CreateAsync(Guid authorId, PostRequestDto postDto);
    Task<PostResponseDto> UpdateAsync(Guid id, PostRequestDto postDto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, PostStatus status);
    Task<bool> UpdateModerationStatusAsync(Guid id, ModerationStatus status);
    Task<IEnumerable<PostResponseDto>> GetPublishedPostsAsync(int page, int pageSize);
    Task<bool> IsAuthorAsync(Guid postId, Guid userId);
    Task<bool> PublishPostAsync(Guid id);
    Task<bool> UnpublishPostAsync(Guid id);
} 