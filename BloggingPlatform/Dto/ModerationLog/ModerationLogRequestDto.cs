using System.ComponentModel.DataAnnotations;
using BloggingPlatform.Models;

namespace BloggingPlatform.Dto.ModerationLog;

public class ModerationLogRequestDto
{
    [Required]
    public Guid ModeratorId { get; set; }

    [Required]
    public TargetType TargetType { get; set; }

    [Required]
    [StringLength(100)]
    public string TargetId { get; set; }

    [Required]
    public ModerationAction Action { get; set; }

    [StringLength(200)]
    public string Reason { get; set; }

    [StringLength(1000)]
    public string Notes { get; set; }
} 