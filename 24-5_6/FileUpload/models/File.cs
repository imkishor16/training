using System;
using System.ComponentModel.DataAnnotations;

namespace FileUpload.Models
{
    public class FileDocument
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string FileName { get; set; } = string.Empty;

        public string FileType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public string ContentType { get; set; } = string.Empty;

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        public string? Metadata { get; set; }

        public byte[]? FileData { get; set; }
    }
}