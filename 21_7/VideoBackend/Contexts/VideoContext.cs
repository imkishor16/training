using Microsoft.EntityFrameworkCore;

namespace Contexts
{
    public class VideoContext : DbContext
{
    public VideoContext(DbContextOptions<VideoContext> options)
        : base(options)
    {
    }

        public DbSet<Models.Video> Videos { get; set; }
    }
}
