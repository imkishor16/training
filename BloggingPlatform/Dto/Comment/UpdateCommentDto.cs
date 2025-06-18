using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models.DTOs
{
    public class UpdateCommentDto
    {
        [Required]
        public string Content { get; set; } = null!;

        public string status { get; set; }
    }
}
