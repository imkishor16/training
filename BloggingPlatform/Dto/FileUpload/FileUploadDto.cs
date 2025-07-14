using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.FileUpload
{
    public class FileUploadDto
{
    [Required]
        public IFormFile File { get; set; }
    }
}