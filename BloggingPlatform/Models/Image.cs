using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloggingPlatform.Models
{
    public class Image
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid PostId { get; set; }

        [Required]
        public string Name { get; set; } 
                
        [Required]
        public byte[] Content { get; set; } 

        public bool IsDeleted { get; set; } = false;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Post Post { get; set; }
    }
}
