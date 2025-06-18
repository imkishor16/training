using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models
{
    public class RefreshToken
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string Token { get; set; } = null!;
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string UserEmail { get; set; } = null!;

        public DateTime Expires { get; set; }
        public bool IsRevoked { get; set; } = false;
    }
}
