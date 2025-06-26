using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

namespace BloggingPlatform.Interfaces
{
    public interface ILikeService
    {
        public Task<Like> ToggleLikeAsync(Like like, Guid userId);
        public Task<Like> GetLikeById(Guid id);
        public Task<Like> GetLikeByPostAndUser(Guid postId, Guid userId);
        // public Task<Like> DeleteLike(Guid id, Guid userId);
    }
}
