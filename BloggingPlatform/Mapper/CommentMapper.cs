using AutoMapper;
using BloggingPlatform.Dto.Comment;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Dto.Post;

public class CommentProfile : Profile
{
    public CommentProfile()
    {
        CreateMap<CreateCommentDto, Comment>()
        .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
        .ForMember(dest => dest.PostId, opt => opt.MapFrom(src => src.PostId))
        .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
        .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));

        CreateMap<UpdateCommentDto, Comment>()
        .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content));

        // Map to BasicCommentDto to prevent circular references
        CreateMap<Comment, BasicCommentDto>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User));
    }
}
