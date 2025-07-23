using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BloggingPlatform.Helpers;

namespace BloggingPlatform.Models
{
    public class Report
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PostId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public ReportCategory Category { get; set; }

        [Required]
        public string Content { get; set; }

        public Post Post { get; set; }
        public User User { get; set; }
    }
}
