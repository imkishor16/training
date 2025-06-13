using System;

namespace BloggingPlatform.Dto.Comment;

public class CommentResponseDto
{
    public int Id { get; set; }
    public string Content { get; set; }
    public int AuthorId { get; set; }
    public string AuthorUsername { get; set; }
    public int PostId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
} 