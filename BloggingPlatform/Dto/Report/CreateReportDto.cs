using System.ComponentModel.DataAnnotations;
using BloggingPlatform.Helpers;

namespace BloggingPlatform.Dto.Report;

public class CreateReportDto
{
        [Required]
        public Guid PostId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string Content { get; set; } = null!;

        [Required]
        public ReportCategory Category{ get; set; }
}