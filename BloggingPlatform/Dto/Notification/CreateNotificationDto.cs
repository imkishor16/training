using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Notification
{
    public class CreateNotificationDto
    {
        [Required]
        public string EntityName { get; set; }
        
        [Required]
        public Guid EntityId { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        [Required]
        public List<Guid> UserIds { get; set; } = new List<Guid>();
    }
} 