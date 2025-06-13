using System;
using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models
{
    public class Image
    {
        public Guid Id { get; set; }
        
        [Required]
        public string FileName { get; set; }
        
        [Required]
        public byte[] Data { get; set; }
        
        public string Description { get; set; }
        public Guid? PostId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Post Post { get; set; }
    }
} 