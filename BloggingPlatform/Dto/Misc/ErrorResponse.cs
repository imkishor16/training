namespace BloggingPlatform.Models.Misc{
    public class ErrorResponseDto
    {
        public int Status { get; set; }
        public string Title { get; set; } = "";
        public string Detail { get; set; } = "";
        public string? StackTrace { get; set; } 
    }
}