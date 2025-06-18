using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using BloggingPlatform.Models;
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
            var comments = await _Context.Comments.SingleOrDefaultAsync(p => p.Id == key);

            return comments ?? throw new Exception("No Commetns with the given ID");
        }

        public override async Task<IEnumerable<Comment>> GetAll()
        {
            var comments = await _Context.Comments.Where(i => !i.IsDeleted).ToListAsync();
            return comments;
        }
    }
}
