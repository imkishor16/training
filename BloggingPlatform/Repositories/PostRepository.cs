using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Contexts;

namespace BloggingPlatform.Repositories;

public class PostRepository : IPostRepository
{
    private readonly BloggingPlatformContext _context;

    public PostRepository(BloggingPlatformContext context)
    {
        _context = context;
    }

    public async Task<Post> GetByIdAsync(Guid id)
    {
        return await _context.Posts
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<IEnumerable<Post>> GetByAuthorIdAsync(Guid authorId)
    {
        return await _context.Posts
            .Include(p => p.Author)
            .Where(p => p.AuthorId == authorId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Post> CreateAsync(Post post)
    {
        await _context.Posts.AddAsync(post);
        await _context.SaveChangesAsync();
        return post;
    }

    public async Task<Post> UpdateAsync(Post post)
    {
        post.UpdatedAt = DateTime.UtcNow;
        _context.Posts.Update(post);
        await _context.SaveChangesAsync();
        return post;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var post = await GetByIdAsync(id);
        if (post == null) return false;

        post.IsDeleted = true;
        post.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateStatusAsync(Guid id, PostStatus status)
    {
        var post = await GetByIdAsync(id);
        if (post == null) return false;

        post.Status = status;
        post.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateModerationStatusAsync(Guid id, ModerationStatus status)
    {
        var post = await GetByIdAsync(id);
        if (post == null) return false;

        post.ModerationStatus = status;
        post.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Post>> GetPublishedPostsAsync(int page, int pageSize)
    {
        return await _context.Posts
            .Include(p => p.Author)
            .Where(p => !p.IsDeleted && p.Status == PostStatus.Published)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
} 