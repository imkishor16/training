using System;

namespace Models
{
    public class Video
{
    public int Id { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    public string BlobUrl { get; set; } 
    }
}
