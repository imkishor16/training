using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Contexts;

namespace BloggingPlatform.Repositories;

public class ModerationLogRepository : IModerationLogRepository
{
    private readonly BloggingPlatformContext _context;

    public ModerationLogRepository(BloggingPlatformContext context)
    {
        _context = context;
    }

    public async Task<ModerationLog> GetByIdAsync(Guid id)
    {
        return await _context.ModerationLogs
            .Include(m => m.Moderator)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<ModerationLog>> GetByModeratorIdAsync(Guid moderatorId)
    {
        return await _context.ModerationLogs
            .Include(m => m.Moderator)
            .Where(m => m.ModeratorId == moderatorId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ModerationLog>> GetByTargetAsync(TargetType targetType, string targetId)
    {
        return await _context.ModerationLogs
            .Include(m => m.Moderator)
            .Where(m => m.TargetType == targetType && m.TargetId == targetId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<ModerationLog> CreateAsync(ModerationLog log)
    {
        await _context.ModerationLogs.AddAsync(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<IEnumerable<ModerationLog>> GetRecentLogsAsync(int count)
    {
        return await _context.ModerationLogs
            .Include(m => m.Moderator)
            .OrderByDescending(m => m.CreatedAt)
            .Take(count)
            .ToListAsync();
    }
} 