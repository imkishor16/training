using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Contexts;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using Microsoft.EntityFrameworkCore;

namespace BloggingPlatform.Repositories
{
    public class ImageRepository : IImageRepository
    {
        private readonly BloggingPlatformContext _context;

        public ImageRepository(BloggingPlatformContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Image> GetByIdAsync(Guid id)
        {
            var image = await _context.Images
                .SingleOrDefaultAsync(i => i.Id == id && !i.IsDeleted);
            
            return image ?? throw new InvalidOperationException($"Image with ID {id} not found");
        }

        public async Task<IEnumerable<Image>> GetByPostIdAsync(Guid postId)
        {
            return await _context.Images
                .Where(i => i.PostId == postId && !i.IsDeleted)
                .ToListAsync();
        }

        public async Task<Image> CreateAsync(Image image)
        {
            if (image == null)
                throw new ArgumentNullException(nameof(image));

            await _context.Images.AddAsync(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<Image> UpdateAsync(Image image)
        {
            if (image == null)
                throw new ArgumentNullException(nameof(image));

            var existingImage = await GetByIdAsync(image.Id);
            _context.Entry(existingImage).CurrentValues.SetValues(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var image = await GetByIdAsync(id);
            image.IsDeleted = true;
            image.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
