using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces;

public interface IModerationLogRepository
{
    Task<ModerationLog> GetByIdAsync(Guid id);
    Task<IEnumerable<ModerationLog>> GetByModeratorIdAsync(Guid moderatorId);
    Task<IEnumerable<ModerationLog>> GetByTargetAsync(TargetType targetType, string targetId);
    Task<ModerationLog> CreateAsync(ModerationLog log);
    Task<IEnumerable<ModerationLog>> GetRecentLogsAsync(int count);
} 