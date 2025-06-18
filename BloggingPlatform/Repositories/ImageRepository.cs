using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using BloggingPlatform.Models;
using Microsoft.EntityFrameworkCore;

namespace BloggingPlatform.Repositories
{
    public class ImageRepository : Repository<Guid,Image>
    {

        public ImageRepository(BloggingPlatformContext context) : base(context)
        {
        }

        public override async Task<Image> Get(Guid id)
        {
            var image = await _Context.Images.SingleOrDefaultAsync(i => i.Id == id && !i.IsDeleted);
            return image ?? throw new Exception("Image not found");
        }

        public override async Task<IEnumerable<Image>> GetAll()
        {
            return await _Context.Images
                .Where(i => !i.IsDeleted)
                .ToListAsync();
        }
    }
}
