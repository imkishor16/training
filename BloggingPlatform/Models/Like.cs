using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloggingPlatform.Models
{
    public class Like
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]

        public Guid UserId { get; set; }

        [Required]
        public Guid PostId { get; set; }


        [Required]
        public bool IsLiked { get; set; } = false;

        public User User { get; set; }
        public Post Post { get; set; }
    }
}
