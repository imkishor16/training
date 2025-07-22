using BloggingPlatform.Helpers;

namespace BloggingPlatform.Models.DTOs
{
    public class ReportQueryDto
    {
        public Guid? UserId { get; set; }
        public Guid? PostId{ get; set; }
        public ReportCategory? Category { get; set; }
        public string SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
