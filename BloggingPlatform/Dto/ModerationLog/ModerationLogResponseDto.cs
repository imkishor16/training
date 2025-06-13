using System;
using BloggingPlatform.Models;

namespace BloggingPlatform.Dto.ModerationLog;

public class ModerationLogResponseDto
{
    public Guid Id { get; set; }
    public Guid ModeratorId { get; set; }
    public string ModeratorUsername { get; set; }
    public TargetType TargetType { get; set; }
    public string TargetId { get; set; }
    public ModerationAction Action { get; set; }
    public string Reason { get; set; }
    public string Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
} 