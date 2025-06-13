using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Comment;

public class CommentRequestDto
{
    [Required]
    public string Content { get; set; }

    [Required]
    public int PostId { get; set; }
} 