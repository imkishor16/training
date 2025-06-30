using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BloggingPlatform.Repositories
{
    public class CommentRepository : Repository<Guid, Comment>
    {
        public CommentRepository(BloggingPlatformContext context) : base(context)
        {
        }

        public override async Task<Comment> Get(Guid key)
        {
            var comment = await _Context.Comments
                .Include(c => c.User)
                .Include(c => c.Post)
                .SingleOrDefaultAsync(c => c.Id == key);

            return comment ?? throw new Exception("No Comments with the given ID");
        }

        public override async Task<IEnumerable<Comment>> GetAll()
        {
            var comments = await _Context.Comments
                .Where(c => !c.IsDeleted)
                .Include(c => c.User)
                .Include(c => c.Post)
                .ToListAsync();
            return comments;
        }
    }
}
