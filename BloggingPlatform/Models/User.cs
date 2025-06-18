using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models
{
    public class User
    {

        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Role { get; set; } = "User"; 

        public bool IsSuspended { get; set; } = false;

        public string? SuspensionReason { get; set; }

        public DateTime? SuspendedUntil { get; set; }

        public bool IsDeleted { get; set; } = false;

        public string Status { get; set; } = "Active"; 

        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
