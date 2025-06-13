using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Dto.Image;

namespace BloggingPlatform.Services;

public class ImageService : IImageService
{
    private readonly IImageRepository _imageRepository;
    private readonly IPostRepository _postRepository;
    private readonly ILogger<ImageService> _logger;

    public ImageService(
        IImageRepository imageRepository,
        IPostRepository postRepository,
        ILogger<ImageService> logger)
    {
        _imageRepository = imageRepository ?? throw new ArgumentNullException(nameof(imageRepository));
        _postRepository = postRepository ?? throw new ArgumentNullException(nameof(postRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<List<Image>> SaveImagesAsync(List<IFormFile> files, Guid postId, string performedByEmail)
    {
        if (files == null || !files.Any())
            throw new ArgumentException("No files provided", nameof(files));

        try
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null)
            {
                _logger.LogWarning("Post with ID {PostId} not found", postId);
                throw new InvalidOperationException($"Post with ID {postId} not found");
            }

            var savedImages = new List<Image>();

            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    _logger.LogWarning("Skipping empty file {FileName}", file.FileName);
                    continue;
                }

                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                var image = new Image
                {
                    FileName = file.FileName,
                    Data = ms.ToArray(),
                    Description = file.ContentType,
                    PostId = postId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdImage = await _imageRepository.CreateAsync(image);
                savedImages.Add(createdImage);
                _logger.LogInformation("Saved image {FileName} for post {PostId} by {UserEmail}", file.FileName, postId, performedByEmail);
            }

            return savedImages;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving images for post {PostId} by {UserEmail}", postId, performedByEmail);
            throw;
        }
    }

    public async Task<List<Image>> UpdateImagesAsync(List<IFormFile> newFiles, Guid postId, string performedByEmail)
    {
        if (newFiles == null || !newFiles.Any())
            throw new ArgumentException("No files provided", nameof(newFiles));

        try
        {
            // Delete existing images
            await DeleteImagesByPostIdAsync(postId, performedByEmail);

            // Save new images
            return await SaveImagesAsync(newFiles, postId, performedByEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating images for post {PostId} by {UserEmail}", postId, performedByEmail);
            throw;
        }
    }

    public async Task DeleteImagesByPostIdAsync(Guid postId, string performedByEmail)
    {
        try
        {
            var images = await _imageRepository.GetByPostIdAsync(postId);
            foreach (var image in images)
            {
                await _imageRepository.DeleteAsync(image.Id);
                _logger.LogInformation("Deleted image {ImageId} for post {PostId} by {UserEmail}", image.Id, postId, performedByEmail);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting images for post {PostId} by {UserEmail}", postId, performedByEmail);
            throw;
        }
    }

    public async Task<ImageResponseDto> GetByIdAsync(Guid id)
    {
        try
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
            {
                _logger.LogWarning("Image with ID {ImageId} not found", id);
                return null;
            }
            return image.ToResponseDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving image with ID {ImageId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<ImageResponseDto>> GetByPostIdAsync(Guid postId)
    {
        try
        {
            var images = await _imageRepository.GetByPostIdAsync(postId);
            return images.Select(i => i.ToResponseDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving images for post {PostId}", postId);
            throw;
        }
    }

    public async Task<ImageResponseDto> CreateAsync(Guid postId, ImageRequestDto imageDto)
    {
        if (imageDto == null)
            throw new ArgumentNullException(nameof(imageDto));

        try
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null)
            {
                _logger.LogWarning("Post with ID {PostId} not found", postId);
                throw new InvalidOperationException($"Post with ID {postId} not found");
            }

            var image = new Image
            {
                FileName = imageDto.FileName,
                Data = imageDto.Data,
                Description = imageDto.Description,
                PostId = postId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdImage = await _imageRepository.CreateAsync(image);
            _logger.LogInformation("Created new image with ID {ImageId} for post {PostId}", createdImage.Id, postId);
            return createdImage.ToResponseDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating image for post {PostId}", postId);
            throw;
        }
    }

    public async Task<ImageResponseDto> UpdateAsync(Guid id, ImageRequestDto imageDto)
    {
        if (imageDto == null)
            throw new ArgumentNullException(nameof(imageDto));

        try
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
            {
                _logger.LogWarning("Image with ID {ImageId} not found", id);
                throw new InvalidOperationException($"Image with ID {id} not found");
            }

            image.FileName = imageDto.FileName;
            image.Data = imageDto.Data;
            image.Description = imageDto.Description;
            image.UpdatedAt = DateTime.UtcNow;

            var updatedImage = await _imageRepository.UpdateAsync(image);
            _logger.LogInformation("Updated image with ID {ImageId}", id);
            return updatedImage.ToResponseDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating image with ID {ImageId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var result = await _imageRepository.DeleteAsync(id);
            if (result)
            {
                _logger.LogInformation("Deleted image with ID {ImageId}", id);
            }
            else
            {
                _logger.LogWarning("Failed to delete image with ID {ImageId}", id);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image with ID {ImageId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteByPostIdAsync(Guid postId)
    {
        try
        {
            var images = await _imageRepository.GetByPostIdAsync(postId);
            foreach (var image in images)
            {
                await _imageRepository.DeleteAsync(image.Id);
            }
            _logger.LogInformation("Deleted all images for post {PostId}", postId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting images for post {PostId}", postId);
            throw;
        }
    }

    public async Task<IEnumerable<ImageResponseDto>> UploadImagesAsync(IFormFileCollection files, Guid postId)
    {
        if (files == null || !files.Any())
            throw new ArgumentException("No files provided", nameof(files));

        try
        {
            var uploadedImages = new List<ImageResponseDto>();

            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    _logger.LogWarning("Skipping empty file {FileName}", file.FileName);
                    continue;
                }

                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                var imageDto = new ImageRequestDto
                {
                    FileName = file.FileName,
                    Data = ms.ToArray(),
                    Description = file.ContentType
                };

                var uploadedImage = await CreateAsync(postId, imageDto);
                uploadedImages.Add(uploadedImage);
            }

            _logger.LogInformation("Successfully uploaded {Count} images for post {PostId}", uploadedImages.Count, postId);
            return uploadedImages;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading images for post {PostId}", postId);
            throw;
        }
    }
}
