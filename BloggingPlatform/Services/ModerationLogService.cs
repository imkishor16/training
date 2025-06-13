using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Dto.ModerationLog;

namespace BloggingPlatform.Services;

public class ModerationLogService : IModerationLogService
{
    private readonly IModerationLogRepository _moderationLogRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ModerationLogService> _logger;

    public ModerationLogService(
        IModerationLogRepository moderationLogRepository,
        IUserRepository userRepository,
        ILogger<ModerationLogService> logger)
    {
        _moderationLogRepository = moderationLogRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ModerationLogResponseDto> GetByIdAsync(Guid id)
    {
        var log = await _moderationLogRepository.GetByIdAsync(id);
        return log?.ToResponseDto();
    }

    public async Task<IEnumerable<ModerationLogResponseDto>> GetByModeratorIdAsync(Guid moderatorId)
    {
        var logs = await _moderationLogRepository.GetByModeratorIdAsync(moderatorId);
        return logs.Select(l => l.ToResponseDto());
    }

    public async Task<IEnumerable<ModerationLogResponseDto>> GetByTargetAsync(TargetType targetType, string targetId)
    {
        var logs = await _moderationLogRepository.GetByTargetAsync(targetType, targetId);
        return logs.Select(l => l.ToResponseDto());
    }

    public async Task<ModerationLogResponseDto> CreateAsync(Guid moderatorId, ModerationLogRequestDto logDto)
    {
        if (!await IsModeratorAsync(moderatorId))
            throw new UnauthorizedAccessException("User is not a moderator");

        if (!await CanModerateTargetAsync(moderatorId, logDto.TargetType, logDto.TargetId))
            throw new UnauthorizedAccessException("User cannot moderate this target");

        var log = new ModerationLog
        {
            ModeratorId = moderatorId,
            TargetType = logDto.TargetType,
            TargetId = logDto.TargetId,
            Action = logDto.Action,
            Reason = logDto.Reason,
            Notes = logDto.Notes
        };

        var createdLog = await _moderationLogRepository.CreateAsync(log);
        return createdLog.ToResponseDto();
    }

    public async Task<IEnumerable<ModerationLogResponseDto>> GetRecentLogsAsync(int count)
    {
        var logs = await _moderationLogRepository.GetRecentLogsAsync(count);
        return logs.Select(l => l.ToResponseDto());
    }

    public async Task<bool> IsModeratorAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user?.Role == UserRole.Moderator || user?.Role == UserRole.Admin;
    }

    public async Task<bool> CanModerateTargetAsync(Guid userId, TargetType targetType, string targetId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        // Admin can moderate everything
        if (user.Role == UserRole.Admin) return true;

        // Moderator can moderate everything except admins
        if (user.Role == UserRole.Moderator)
        {
            if (targetType == TargetType.User)
            {
                var targetUser = await _userRepository.GetByIdAsync(Guid.Parse(targetId));
                return targetUser?.Role != UserRole.Admin;
            }
            return true;
        }

        return false;
    }
} 