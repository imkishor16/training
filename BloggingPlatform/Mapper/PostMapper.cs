using AutoMapper;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Dto.Post;

public class PostProfile : Profile
{
    public PostProfile()
    {
        CreateMap<CreatePostDto, Post>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
            .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
            .ForMember(dest => dest.PostStatus, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.Likes, opt => opt.Ignore());

        CreateMap<UpdatePostDto, Post>()
            .ForMember(dest => dest.Title, opt => opt.Condition(src => src.Title != null))
            .ForMember(dest => dest.Content, opt => opt.Condition(src => src.Content != null))
            .ForMember(dest => dest.PostStatus, opt => opt.Condition(src => src.PostStatus != null))
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.Likes, opt => opt.Ignore());

        // Map Post to PostResponseDto
        CreateMap<Post, PostResponseDto>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments))
            .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => src.Likes.Count(l => l.IsLiked)))
            .ForMember(dest => dest.PostStatus, opt => opt.MapFrom(src => src.PostStatus.ToString()))
            .ForMember(dest => dest.UserHasLiked, opt => opt.Ignore()); // This should be set in the service layer

        // Map User to BasicUserDto
        CreateMap<User, BasicUserDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username));

        // Map Comment to BasicCommentDto
        CreateMap<Comment, BasicCommentDto>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User));
    }
}
