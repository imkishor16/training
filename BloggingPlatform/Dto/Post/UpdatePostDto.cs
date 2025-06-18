using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models.DTOs
{
    public class UpdatePostDto
    {
        public string? Title { get; set; }

        public string? Slug { get; set; }

        public string? Content { get; set; }

        public string? Status { get; set; } = "Published";

        public List<IFormFile> Images { get; set; } = new();

    }
}
