using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Models;
using Interfaces;
using Contexts;

namespace Repositories
{
    public class VideoRepository : IVideoRepository
    {
        private readonly VideoContext _context;
        public VideoRepository(VideoContext context)
        {
            _context = context;
        }
        public async Task<Video> AddVideoAsync(Video video)
        {
            _context.Videos.Add(video);
            await _context.SaveChangesAsync();
            return video;
        }
        public async Task<IEnumerable<Video>> GetAllVideosAsync()
        {
            return await _context.Videos.ToListAsync();
        }
        public async Task<Video> GetVideoByIdAsync(int id)
        {
            return await _context.Videos.FindAsync(id);
        }
    }
} 