using AutoMapper;
using BloggingPlatform.Dto.Notification;
using BloggingPlatform.Models;

namespace BloggingPlatform.Mapper
{
    public class NotificationMapper : Profile
    {
        public NotificationMapper()
        {
            CreateMap<Notification, NotificationResponseDto>();
            CreateMap<CreateNotificationDto, Notification>();
            CreateMap<UserNotifications, NotificationResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Notification.Id))
                .ForMember(dest => dest.EntityName, opt => opt.MapFrom(src => src.Notification.EntityName))
                .ForMember(dest => dest.EntityId, opt => opt.MapFrom(src => src.Notification.EntityId))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Notification.Content))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Notification.CreatedAt))
                .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => src.IsRead))
                .ForMember(dest => dest.ReadAt, opt => opt.MapFrom(src => src.ReadAt));
        }
    }
} 