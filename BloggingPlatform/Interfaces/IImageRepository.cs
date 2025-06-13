using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces;

public interface IImageRepository
{
    Task<Image> GetByIdAsync(Guid id);
    Task<IEnumerable<Image>> GetByPostIdAsync(Guid postId);
    Task<Image> CreateAsync(Image image);
    Task<Image> UpdateAsync(Image image);
    Task<bool> DeleteAsync(Guid id);
} 