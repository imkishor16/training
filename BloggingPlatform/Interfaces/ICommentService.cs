using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;
using BloggingPlatform.Dto.Comment;

namespace BloggingPlatform.Interfaces;

public interface ICommentService
{
    Task<CommentResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<CommentResponseDto>> GetByPostIdAsync(Guid postId);
    Task<IEnumerable<CommentResponseDto>> GetByAuthorIdAsync(Guid authorId);
    Task<CommentResponseDto> CreateAsync(Guid authorId, CommentRequestDto commentDto);
    Task<CommentResponseDto> UpdateAsync(Guid id, CommentRequestDto commentDto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> IsAuthorAsync(Guid commentId, Guid userId);
    Task<bool> IsPostActiveAsync(Guid postId);
} 