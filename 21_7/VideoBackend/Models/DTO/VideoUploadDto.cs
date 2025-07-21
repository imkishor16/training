using Microsoft.AspNetCore.Http;

namespace Models.DTO
{
    public class VideoUploadDto
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public IFormFile VideoFile { get; set; }
    }
}
