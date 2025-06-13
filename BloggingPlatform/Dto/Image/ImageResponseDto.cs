using System;

namespace BloggingPlatform.Dto.Image;

public class ImageResponseDto
{
    public int Id { get; set; }
    public string FileName { get; set; }
    public string Description { get; set; }
    public int? PostId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
} 