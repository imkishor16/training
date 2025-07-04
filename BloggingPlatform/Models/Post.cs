using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloggingPlatform.Models
{
    public class Post
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]

        public Guid UserId { get; set; }

        [Required]
        public string Title { get; set; }


        [Required]
        public string Content { get; set; }

        public string PostStatus { get; set; } = "Published"; //Published, Draft, Archived
        public bool IsDeleted { get; set; } = false;

        public User User { get; set; }
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Image> Images { get; set; } = new List<Image>();
        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}
