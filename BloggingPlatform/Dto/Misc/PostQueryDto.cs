namespace BloggingPlatform.Models.DTOs
{
    public class PostQueryDto
{
    public Guid? UserId { get; set; }
    public string? Status { get; set; }
    public string? SearchTerm { get; set; }
    public string? SortOrder { get; set; } = "asc";
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }
}

}