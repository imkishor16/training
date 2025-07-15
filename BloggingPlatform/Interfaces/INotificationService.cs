using BloggingPlatform.Dto.Notification;
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationResponseDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto);
        Task<List<NotificationResponseDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<NotificationResponseDto> GetNotificationByIdAsync(int notificationId, Guid userId);
        Task<bool> MarkNotificationAsReadAsync(int notificationId, Guid userId);
        Task<bool> MarkAllNotificationsAsReadAsync(Guid userId);
        Task<bool> DeleteNotificationAsync(int notificationId, Guid userId);
        Task<int> GetUnreadNotificationCountAsync(Guid userId);
        Task<bool> CreateNotificationForUsersAsync(string entityName, int entityId, string content, List<Guid> userIds);
    }
} 