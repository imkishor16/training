using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Models;

namespace Interfaces
{
    public interface IVideoService
    {
        Task<Video> UploadVideoAsync(string title, string description, IFormFile file);
        Task<IEnumerable<Video>> GetAllVideosAsync();
        Task<Video> GetVideoByIdAsync(int id);
    }
} 