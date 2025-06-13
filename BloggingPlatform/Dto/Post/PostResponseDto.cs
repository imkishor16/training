using System;
using BloggingPlatform.Models;

namespace BloggingPlatform.Dto.Post;

public class PostResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorUsername { get; set; }
    public PostStatus Status { get; set; }
    public ModerationStatus ModerationStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CommentCount { get; set; }
} 