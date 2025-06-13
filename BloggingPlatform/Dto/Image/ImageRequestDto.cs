using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Image;

public class ImageRequestDto
{
    [Required]
    public string FileName { get; set; }

    [Required]
    public byte[] Data { get; set; }

    public string Description { get; set; }
    public int? PostId { get; set; }
} 