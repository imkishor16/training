using AutoMapper;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

public class PostProfile : Profile
{
    public PostProfile()
    {
        CreateMap<CreatePostDto, Post>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => src.Slug))
            .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
            .ForMember(dest => dest.PostStatus, opt => opt.MapFrom(src => src.Status))
           .ForMember(dest => dest.Images, opt => opt.Ignore());


CreateMap<UpdatePostDto, Post>()
    .ForMember(dest => dest.Title, opt => opt.Condition(src => src.Title != null))
    .ForMember(dest => dest.Slug, opt => opt.Condition(src => src.Slug != null))
    .ForMember(dest => dest.Content, opt => opt.Condition(src => src.Content != null))
    .ForMember(dest => dest.PostStatus, opt => opt.Condition(src => src.Status != null))
    .ForMember(dest => dest.Images, opt => opt.Ignore());



    }
}
