using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface IImageService
    {
        public Task<List<Image>> SaveImagesAsync(List<IFormFile> files, Guid postId, Guid userId);
        public Task<List<Image>> UpdateImagesAsync(List<IFormFile> newFiles, Guid postId, Guid userId);
        public Task DeleteImagesByPostIdAsync(Guid postId, Guid userId);

        
    }
}
