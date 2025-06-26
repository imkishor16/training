using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using BloggingPlatform.Models;
using Microsoft.EntityFrameworkCore;

namespace BloggingPlatform.Repositories
{
    public class LikeRepository : Repository<Guid, Like>
    {
        public LikeRepository(BloggingPlatformContext context) : base(context)
        {
        }

        public override async Task<Like> Get(Guid key)
        {
            var likes = await _Context.Likes
                .Include(l => l.User)
                .Include(l => l.Post)
                .SingleOrDefaultAsync(p => p.Id == key);
            return likes ?? throw new Exception("No Likes with the given ID");
        }

        public override async Task<IEnumerable<Like>> GetAll()
        {
            var likes = await _Context.Likes
                .Include(l => l.User)
                .Include(l => l.Post)
                .ToListAsync();
            return likes;
        }
    }
}
