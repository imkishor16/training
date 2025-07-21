using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Models;
using Interfaces;

namespace Services
{
    public class VideoService : IVideoService
    {
        private readonly IVideoRepository _videoRepository;
        private readonly BlobContainerClient _blobContainerClient;
        public VideoService(IVideoRepository videoRepository, BlobContainerClient blobContainerClient)
        {
            _videoRepository = videoRepository;
            _blobContainerClient = blobContainerClient;
        }
        public async Task<Video> UploadVideoAsync(string title, string description, IFormFile file)
        {
            var blobClient = _blobContainerClient.GetBlobClient(Guid.NewGuid() + "-" + file.FileName);
            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
            }
            var video = new Video
            {
                Title = title,
                Description = description,
                UploadDate = DateTime.UtcNow,
                BlobUrl = blobClient.Uri.ToString()
            };
            return await _videoRepository.AddVideoAsync(video);
        }
        public Task<IEnumerable<Video>> GetAllVideosAsync() => _videoRepository.GetAllVideosAsync();
        public Task<Video> GetVideoByIdAsync(int id) => _videoRepository.GetVideoByIdAsync(id);
    }
} 