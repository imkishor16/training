using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IVideoRepository
    {
        Task<Video> AddVideoAsync(Video video);
        Task<IEnumerable<Video>> GetAllVideosAsync();
        Task<Video> GetVideoByIdAsync(int id);
    }
} 