using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloggingPlatform.Models;

    public class BlogPost
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key to Author (User)
        public int AuthorId { get; set; }
        public User? Author { get; set; }

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
