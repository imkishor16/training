using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models.DTOs
{
    public class UpdatePostDto
    {
        public string? Title { get; set; }

        public string? Content { get; set; }

        public string? PostStatus { get; set; } = "Published"; // deleted

        public List<IFormFile> Images { get; set; } = new();

    }
}
