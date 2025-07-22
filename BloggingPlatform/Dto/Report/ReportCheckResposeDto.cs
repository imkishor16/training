using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.Report;

public class ReportCheckResponseDto
{
    public string Message { get; set; }
    public bool IsExists { get; set; }
}