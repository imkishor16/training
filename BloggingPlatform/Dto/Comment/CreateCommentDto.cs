using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Comment;

public class CreateCommentDto
{
        [Required]
        public Guid PostId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string Content { get; set; } = null!;

        public string Status { get; set; } = "Available";

}