using BloggingPlatform.Helpers;
using BloggingPlatform.Models;

namespace BloggingPlatform.Dto.Post
{
    public class PostResponseAdminDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string PostStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public BasicUserDto User { get; set; }
        public List<BasicReportDto> Reports { get; set; }
        public int ReportCount { get; set; }
    }

    public class BasicReportDto{
        public Guid Id { get; set; }
        public ReportCategory Category{ get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public BasicUserDto User { get; set; }
    }
} 