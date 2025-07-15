using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface INotificationRepository : IRepository<int, Notification>
    {
        Task<List<UserNotifications>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<UserNotifications> GetUserNotificationAsync(int notificationId, Guid userId);
        Task<int> GetUnreadNotificationCountAsync(Guid userId);
        Task<bool> MarkNotificationAsReadAsync(int notificationId, Guid userId);
        Task<bool> MarkAllNotificationsAsReadAsync(Guid userId);
        Task<bool> DeleteUserNotificationAsync(int notificationId, Guid userId);
        Task<bool> CreateNotificationForUsersAsync(Notification notification, List<Guid> userIds);
    }
}   