using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;
using BloggingPlatform.Dto.ModerationLog;

namespace BloggingPlatform.Interfaces;

public interface IModerationLogService
{
    Task<ModerationLogResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<ModerationLogResponseDto>> GetByModeratorIdAsync(Guid moderatorId);
    Task<IEnumerable<ModerationLogResponseDto>> GetByTargetAsync(TargetType targetType, string targetId);
    Task<ModerationLogResponseDto> CreateAsync(Guid moderatorId, ModerationLogRequestDto logDto);
    Task<IEnumerable<ModerationLogResponseDto>> GetRecentLogsAsync(int count);
    Task<bool> IsModeratorAsync(Guid userId);
    Task<bool> CanModerateTargetAsync(Guid userId, TargetType targetType, string targetId);
} 