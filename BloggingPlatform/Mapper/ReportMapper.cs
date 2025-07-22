using AutoMapper;
using BloggingPlatform.Dto.Report;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

public class ReportProfile : Profile
{
    public ReportProfile()
    {
        CreateMap<CreateReportDto, Report>()
        .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
        .ForMember(dest => dest.PostId, opt => opt.MapFrom(src => src.PostId))
        .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
        .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category));
    }
}