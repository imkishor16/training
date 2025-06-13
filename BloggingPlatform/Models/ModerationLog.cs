using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloggingPlatform.Models
{
    public class ModerationLog
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ModeratorId { get; set; }

        [Required]
        public TargetType TargetType { get; set; }  // Post, Comment, User

        [Required]
        public Guid TargetId { get; set; }

        [Required]
        public ModerationAction Action { get; set; }

        [StringLength(200)]
        public string Reason { get; set; }

        [StringLength(1000)]
        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("ModeratorId")]
        public virtual User Moderator { get; set; }
    }


} 