using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using Microsoft.OpenApi.Extensions;
using System.Text.Json;

namespace BloggingPlatform.Services
{
    public class LikeService : ILikeService
    {
        private readonly IRepository<Guid, Like> _likeRepo;
        private readonly IUserValidationService _userValidationService;

        public LikeService(IRepository<Guid, Like> likeRepo, IUserValidationService userValidationService)
        {
            _likeRepo = likeRepo;
            _userValidationService = userValidationService;
        }

        public async Task<Like> ToggleLikeAsync(Like likeDto, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);

            var existingLike = (await _likeRepo.GetAll())
                .FirstOrDefault(l => l.PostId == likeDto.PostId && l.UserId == likeDto.UserId);

            if (likeDto.IsLiked)
            {
                if (existingLike == null)
                {
                    // Create new like
                    var newLike = new Like
                    {
                        Id = Guid.NewGuid(),
                        PostId = likeDto.PostId,
                        UserId = likeDto.UserId,
                        IsLiked = true
                    };
                    await _likeRepo.Add(newLike);
                    return newLike;
                }
                else if (!existingLike.IsLiked)
                {
                    // Reactivate soft-deleted like
                    existingLike.IsLiked = true;
                    await _likeRepo.Update(existingLike.Id, existingLike);
                }
                // else: already liked
            }
            else
            {
                if (existingLike != null && existingLike.IsLiked)
                {
                    existingLike.IsLiked = false;
                    await _likeRepo.Update(existingLike.Id, existingLike);
                }
                // else: already unliked
            }

            return existingLike ?? likeDto;
        }

        public async Task<Like> GetLikeById(Guid id)
        {
            return await _likeRepo.Get(id);
        }

        public async Task<Like> GetLikeByPostAndUser(Guid postId, Guid userId)
        {
            var allLikes = await _likeRepo.GetAll();
            return allLikes
                .FirstOrDefault(l => l.PostId == postId && l.UserId == userId && l.IsLiked);
        }
    }

}
