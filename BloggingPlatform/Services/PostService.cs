using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Dto.Post;

namespace BloggingPlatform.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ILogger<PostService> _logger;

    public PostService(IPostRepository postRepository, ILogger<PostService> logger)
    {
        _postRepository = postRepository;
        _logger = logger;
    }

    public async Task<PostResponseDto> GetByIdAsync(Guid id)
    {
        var post = await _postRepository.GetByIdAsync(id);
        return post?.ToResponseDto();
    }

    public async Task<IEnumerable<PostResponseDto>> GetByAuthorIdAsync(Guid authorId)
    {
        var posts = await _postRepository.GetByAuthorIdAsync(authorId);
        return posts.Select(p => p.ToResponseDto());
    }

    public async Task<PostResponseDto> CreateAsync(Guid authorId, PostRequestDto postDto)
    {
        var post = new Post
        {
            Title = postDto.Title,
            Content = postDto.Content,
            AuthorId = authorId,
            Status = PostStatus.Draft,
            ModerationStatus = ModerationStatus.Pending
        };

        var createdPost = await _postRepository.CreateAsync(post);
        return createdPost.ToResponseDto();
    }

    public async Task<PostResponseDto> UpdateAsync(Guid id, PostRequestDto postDto)
    {
        var post = await _postRepository.GetByIdAsync(id);
        if (post == null)
            throw new InvalidOperationException("Post not found");

        post.Title = postDto.Title;
        post.Content = postDto.Content;
        post.UpdatedAt = DateTime.UtcNow;

        var updatedPost = await _postRepository.UpdateAsync(post);
        return updatedPost.ToResponseDto();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _postRepository.DeleteAsync(id);
    }

    public async Task<bool> UpdateStatusAsync(Guid id, PostStatus status)
    {
        return await _postRepository.UpdateStatusAsync(id, status);
    }

    public async Task<bool> UpdateModerationStatusAsync(Guid id, ModerationStatus status)
    {
        return await _postRepository.UpdateModerationStatusAsync(id, status);
    }

    public async Task<IEnumerable<PostResponseDto>> GetPublishedPostsAsync(int page, int pageSize)
    {
        var posts = await _postRepository.GetPublishedPostsAsync(page, pageSize);
        return posts.Select(p => p.ToResponseDto());
    }

    public async Task<bool> IsAuthorAsync(Guid postId, Guid userId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        return post?.AuthorId == userId;
    }

    public async Task<bool> PublishPostAsync(Guid id)
    {
        var post = await _postRepository.GetByIdAsync(id);
        if (post == null) return false;

        if (post.ModerationStatus != ModerationStatus.Approved)
            throw new InvalidOperationException("Post must be approved before publishing");

        return await _postRepository.UpdateStatusAsync(id, PostStatus.Published);
    }

    public async Task<bool> UnpublishPostAsync(Guid id)
    {
        return await _postRepository.UpdateStatusAsync(id, PostStatus.Draft);
    }
} 