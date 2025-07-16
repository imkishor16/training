using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models
{
    public class UserNotifications
    {
        [Key]
        public Guid Id { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime? ReadAt { get; set; }
        
        public int NotificationId { get; set; }
        public Notification Notification { get; set; }
        
        public Guid UserId { get; set; }
        public User User { get; set; }
    }
} 