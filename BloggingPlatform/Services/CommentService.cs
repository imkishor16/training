using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Dto.Comment;

namespace BloggingPlatform.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly IPostRepository _postRepository;
    private readonly ILogger<CommentService> _logger;

    public CommentService(
        ICommentRepository commentRepository,
        IPostRepository postRepository,
        ILogger<CommentService> logger)
    {
        _commentRepository = commentRepository;
        _postRepository = postRepository;
        _logger = logger;
    }

    public async Task<CommentResponseDto> GetByIdAsync(Guid id)
    {
        var comment = await _commentRepository.GetByIdAsync(id);
        return comment?.ToResponseDto();
    }

    public async Task<IEnumerable<CommentResponseDto>> GetByPostIdAsync(Guid postId)
    {
        var comments = await _commentRepository.GetByPostIdAsync(postId);
        return comments.Select(c => c.ToResponseDto());
    }

    public async Task<IEnumerable<CommentResponseDto>> GetByAuthorIdAsync(Guid authorId)
    {
        var comments = await _commentRepository.GetByAuthorIdAsync(authorId);
        return comments.Select(c => c.ToResponseDto());
    }

    public async Task<CommentResponseDto> CreateAsync(Guid authorId, CommentRequestDto commentDto)
    {
        if (!await IsPostActiveAsync(commentDto.PostId))
            throw new InvalidOperationException("Cannot comment on inactive post");

        var comment = new Comment
        {
            Content = commentDto.Content,
            AuthorId = authorId,
            PostId = commentDto.PostId
        };

        var createdComment = await _commentRepository.CreateAsync(comment);
        return createdComment.ToResponseDto();
    }

    public async Task<CommentResponseDto> UpdateAsync(Guid id, CommentRequestDto commentDto)
    {
        var comment = await _commentRepository.GetByIdAsync(id);
        if (comment == null)
            throw new InvalidOperationException("Comment not found");

        comment.Content = commentDto.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        var updatedComment = await _commentRepository.UpdateAsync(comment);
        return updatedComment.ToResponseDto();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _commentRepository.DeleteAsync(id);
    }

    public async Task<bool> IsAuthorAsync(Guid commentId, Guid userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        return comment?.AuthorId == userId;
    }

    public async Task<bool> IsPostActiveAsync(Guid postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        return post != null && !post.IsDeleted && post.Status == PostStatus.Published;
    }
} 