using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Models.DTOs
{
    public class CreatePostDto
    {
        [Required]
        public Guid UserId { get; set; } 

        [Required]
        [StringLength(150, ErrorMessage = "Title can't exceed 150 characters.")]
        public string Title { get; set; } = null!;
        
        [Required]
        public string Slug { get; set; } = null!;
        [Required]
        [MinLength(10, ErrorMessage = "Content must be at least 10 characters long.")]
        public string Content { get; set; } = null!;

        public string Status { get; set; } = "Published";
        public List<IFormFile> Images { get; set; } = new List<IFormFile>();

    }
}
