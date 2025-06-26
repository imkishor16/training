using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using BloggingPlatform.Models;
using Microsoft.EntityFrameworkCore;

namespace BloggingPlatform.Repositories
{
    public class PostRepository : Repository<Guid, Post>
    {
        public PostRepository(BloggingPlatformContext context) : base(context)
        {
        }

        public override async Task<Post> Get(Guid key)
        {
            var post = await _Context.Posts
                .Include(p => p.User)
                .Include(p => p.Images)
                .Include(p => p.Comments)
                .Include(p => p.Likes)
                .SingleOrDefaultAsync(p => p.Id == key);

            return post;
        }

        public override async Task<IEnumerable<Post>> GetAll()
        {
            var posts = await _Context.Posts
                .Where(p => !p.IsDeleted)
                .Include(p => p.User)
                .Include(p => p.Images.Where(i => !i.IsDeleted))
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .Include(p => p.Likes)
                .ToListAsync();

            return posts;
        }
    }
}
