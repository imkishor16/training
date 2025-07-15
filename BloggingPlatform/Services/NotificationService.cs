using AutoMapper;
using BloggingPlatform.Dto.Notification;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;

namespace BloggingPlatform.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;

        public NotificationService(INotificationRepository notificationRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
        }

        public async Task<NotificationResponseDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto)
        {
            var notification = new Notification
            {
                EntityName = createNotificationDto.EntityName,
                EntityId = createNotificationDto.EntityId,
                Content = createNotificationDto.Content,
                CreatedAt = DateTime.UtcNow
            };

            var success = await _notificationRepository.CreateNotificationForUsersAsync(notification, createNotificationDto.UserIds);
            
            if (!success)
                throw new Exception("Failed to create notification");

            return _mapper.Map<NotificationResponseDto>(notification);
        }

        public async Task<List<NotificationResponseDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            var userNotifications = await _notificationRepository.GetUserNotificationsAsync(userId, page, pageSize);
            
            return userNotifications.Select(un => new NotificationResponseDto
            {
                Id = un.Notification.Id,
                EntityName = un.Notification.EntityName,
                EntityId = un.Notification.EntityId,
                Content = un.Notification.Content,
                CreatedAt = un.Notification.CreatedAt,
                IsRead = un.IsRead,
                ReadAt = un.ReadAt
            }).ToList();
        }

        public async Task<NotificationResponseDto> GetNotificationByIdAsync(int notificationId, Guid userId)
        {
            var userNotification = await _notificationRepository.GetUserNotificationAsync(notificationId, userId);
            
            if (userNotification == null)
                throw new Exception("Notification not found");

            return new NotificationResponseDto
            {
                Id = userNotification.Notification.Id,
                EntityName = userNotification.Notification.EntityName,
                EntityId = userNotification.Notification.EntityId,
                Content = userNotification.Notification.Content,
                CreatedAt = userNotification.Notification.CreatedAt,
                IsRead = userNotification.IsRead,
                ReadAt = userNotification.ReadAt
            };
        }

        public async Task<bool> MarkNotificationAsReadAsync(int notificationId, Guid userId)
        {
            return await _notificationRepository.MarkNotificationAsReadAsync(notificationId, userId);
        }

        public async Task<bool> MarkAllNotificationsAsReadAsync(Guid userId)
        {
            return await _notificationRepository.MarkAllNotificationsAsReadAsync(userId);
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, Guid userId)
        {
            return await _notificationRepository.DeleteUserNotificationAsync(notificationId, userId);
        }

        public async Task<int> GetUnreadNotificationCountAsync(Guid userId)
        {
            return await _notificationRepository.GetUnreadNotificationCountAsync(userId);
        }

        public async Task<bool> CreateNotificationForUsersAsync(string entityName, int entityId, string content, List<Guid> userIds)
        {
            if (!userIds.Any())
                return false;

            var notification = new Notification
            {
                EntityName = entityName,
                EntityId = entityId,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            return await _notificationRepository.CreateNotificationForUsersAsync(notification, userIds);
        }
    }
} 