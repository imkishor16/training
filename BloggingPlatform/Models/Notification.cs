using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string EntityName { get; set; } 
        
        [Required]
        public Guid EntityId { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public List<UserNotifications> NotificationUsers { get; set; } = new List<UserNotifications>();
    }
} 