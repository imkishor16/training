using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Notification
{
    public class UpdateNotificationDto
    {
        [Required]
        public bool IsRead { get; set; }
    }
} 