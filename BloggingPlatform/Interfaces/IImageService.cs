using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface IImageService
    {
        public Task<List<Image>> SaveImagesAsync(List<IFormFile> files, Guid postId, string performedByEmail);
        public Task<List<Image>> UpdateImagesAsync(List<IFormFile> newFiles, Guid postId, string performedByEmail);
        public Task DeleteImagesByPostIdAsync(Guid postId, string performedByEmail);

        
    }
}
