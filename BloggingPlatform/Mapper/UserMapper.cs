using AutoMapper;
using BloggingPlatform.Dto.User;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

namespace BloggingPlatform.Helpers
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Username))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
            CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Role, opt => opt.Condition(src => src.Role != null))
            .ForMember(dest => dest.IsSuspended, opt => opt.Condition(src => src.IsSuspended.HasValue))
            .ForMember(dest => dest.SuspensionReason, opt => opt.Condition(src => src.SuspensionReason != null))
            .ForMember(dest => dest.SuspendedUntil, opt => opt.Condition(src => src.SuspendedUntil.HasValue))
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
            CreateMap<UserResponseDto, User>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
            .ForMember(dest => dest.IsSuspended, opt => opt.MapFrom(src => src.IsSuspended))
            .ForMember(dest => dest.SuspensionReason, opt => opt.MapFrom(src => src.SuspensionReason))
            .ForMember(dest => dest.SuspendedUntil, opt => opt.MapFrom(src => src.SuspendedUntil))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));
            
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.LastLoginAt, opt => opt.Ignore());
                

            CreateMap<UserResponseDto, User>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Username))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Posts, opt => opt.Ignore())
                .ForMember(dest => dest.Comments, opt => opt.Ignore())
                .ForMember(dest => dest.Likes, opt => opt.Ignore());
        }
    }
}
