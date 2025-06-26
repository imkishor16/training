using AutoMapper;
using BloggingPlatform.Dto.Like;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

public class LikeProfile : Profile
{
    public LikeProfile()
    {
        CreateMap<CreateLikeDto, Like>()
        .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
        .ForMember(dest => dest.PostId, opt => opt.MapFrom(src => src.PostId))
        .ForMember(dest => dest.IsLiked, opt => opt.MapFrom(src => src.IsLiked));

        CreateMap<UpdateLikeDto, Like>()
        .ForMember(dest => dest.IsLiked, opt => opt.MapFrom(src => src.IsLiked));

    }
}
