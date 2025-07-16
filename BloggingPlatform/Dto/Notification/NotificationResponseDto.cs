namespace BloggingPlatform.Dto.Notification
{
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public string EntityName { get; set; }
        public Guid EntityId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
} 