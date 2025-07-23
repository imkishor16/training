using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BloggingPlatform.Repositories
{
    public class ReportRepository : Repository<Guid, Report>
    {
        public ReportRepository(BloggingPlatformContext context) : base(context)
        { }

        public override async Task<Report> Get(Guid key)
        {
            var comment = await _Context.Reports
                .Include(c => c.User)
                .Include(c => c.Post)
                .SingleOrDefaultAsync(c => c.Id == key);

            return comment ?? throw new Exception("No Reports with the given ID");
        }

        public override async Task<IEnumerable<Report>> GetAll()
        {
            var comments = await _Context.Reports
                .Include(c => c.User)
                .Include(c => c.Post)
                .ToListAsync();
            return comments;
        }

        
    }
}
