using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Post;

public class PostRequestDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [Required]
    public string Content { get; set; }
} 