namespace BloggingPlatform.Models.DTOs
{
    public class CommentQueryDto
    {
        public Guid? UserId { get; set; }
        public Guid? PostId{ get; set; }
        public string? Status { get; set; }
        public string SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
