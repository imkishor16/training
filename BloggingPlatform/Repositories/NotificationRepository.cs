using Microsoft.EntityFrameworkCore;
using BloggingPlatform.Contexts;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;

namespace BloggingPlatform.Repositories
{
    public class NotificationRepository : Repository<int, Notification>, INotificationRepository
    {
        public NotificationRepository(BloggingPlatformContext context) : base(context)
        {
        }

        public override async Task<Notification> Get(int key)
        {
            return await _Context.Notifications
                .Include(n => n.NotificationUsers)
                .FirstOrDefaultAsync(n => n.Id == key);
        }

        public override async Task<IEnumerable<Notification>> GetAll()
        {
            return await _Context.Notifications
                .Include(n => n.NotificationUsers)
                .ToListAsync();
        }

        public async Task<List<UserNotifications>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            return await _Context.UserNotifications
                .Include(un => un.Notification)
                .Where(un => un.UserId == userId)
                .OrderByDescending(un => un.Notification.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<UserNotifications> GetUserNotificationAsync(int notificationId, Guid userId)
        {
            return await _Context.UserNotifications
                .Include(un => un.Notification)
                .FirstOrDefaultAsync(un => un.NotificationId == notificationId && un.UserId == userId);
        }

        public async Task<int> GetUnreadNotificationCountAsync(Guid userId)
        {
            return await _Context.UserNotifications
                .CountAsync(un => un.UserId == userId && !un.IsRead);
        }

        public async Task<bool> MarkNotificationAsReadAsync(int notificationId, Guid userId)
        {
            var userNotification = await _Context.UserNotifications
                .FirstOrDefaultAsync(un => un.NotificationId == notificationId && un.UserId == userId);

            if (userNotification == null)
                return false;

            userNotification.IsRead = true;
            userNotification.ReadAt = DateTime.UtcNow;

            await _Context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllNotificationsAsReadAsync(Guid userId)
        {
            var userNotifications = await _Context.UserNotifications
                .Where(un => un.UserId == userId && !un.IsRead)
                .ToListAsync();

            if (!userNotifications.Any())
                return false;

            foreach (var notification in userNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _Context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserNotificationAsync(int notificationId, Guid userId)
        {
            var userNotification = await _Context.UserNotifications
                .FirstOrDefaultAsync(un => un.NotificationId == notificationId && un.UserId == userId);

            if (userNotification == null)
                return false;

            _Context.UserNotifications.Remove(userNotification);
            await _Context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CreateNotificationForUsersAsync(Notification notification, List<Guid> userIds)
        {
            try
            {
                // Add the notification
                await _Context.Notifications.AddAsync(notification);
                await _Context.SaveChangesAsync();

                // Create UserNotifications for each user
                var userNotifications = userIds.Select(userId => new UserNotifications
                {
                    NotificationId = notification.Id,
                    UserId = userId,
                    IsRead = false
                }).ToList();

                await _Context.UserNotifications.AddRangeAsync(userNotifications);
                await _Context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
} 