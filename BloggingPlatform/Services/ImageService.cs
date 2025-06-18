using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using System.Text.Json;

namespace BloggingPlatform.Services
{
    public class ImageService : IImageService
    {
        private readonly IRepository<Guid, Image> _imageRepository;

        public ImageService(IRepository<Guid, Image> imageRepository)
        {
            _imageRepository = imageRepository;
        }

        public async Task<List<Image>> SaveImagesAsync(List<IFormFile> files, Guid postId, Guid userId)
        {
            var savedImages = new List<Image>();

            foreach (var file in files)
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                var image = new Image
                {
                    Id = Guid.NewGuid(),
                    Name = file.FileName,
                    PostId = postId,
                    Content = ms.ToArray(),
                    UploadedAt = DateTime.UtcNow
                };

                await _imageRepository.Add(image);
                savedImages.Add(image);
            }

            return savedImages;
        }
        public async Task<List<Image>> UpdateImagesAsync(List<IFormFile> newFiles, Guid postId, Guid userId)
        {
            var existing = await _imageRepository.GetAll();
            var toDelete = existing.Where(i => i.PostId == postId).ToList();

            foreach (var img in toDelete)
            {
                await _imageRepository.Delete(img.Id);
                
            }

            return await SaveImagesAsync(newFiles, postId, userId);
        }

        public async Task DeleteImagesByPostIdAsync(Guid postId, Guid userId)
        {
            var images = await _imageRepository.GetAll();
            var toDelete = images.Where(i => i.PostId == postId).ToList();

            foreach (var img in toDelete)
            {
                if (img.IsDeleted == true)
                {
                    continue;
                }
                else
                {
                    img.IsDeleted = true;
                    await _imageRepository.Update(img.Id,img);
                }
            }
        }

    }
}
