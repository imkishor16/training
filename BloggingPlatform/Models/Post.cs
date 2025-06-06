using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace BloggingPlatform.Models;

public class Post
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}