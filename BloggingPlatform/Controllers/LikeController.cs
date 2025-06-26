using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using System.Security.Claims;
using BloggingPlatform.Dto.Like;


namespace BloggingPlatform.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/likes")]
    [ApiVersion("1.0")]
    public class LikeController : ControllerBase
    {
        private readonly ILikeService _likeService;
        private readonly IMapper _mapper;

        public LikeController(ILikeService likeService, IMapper mapper)
        {
            _likeService = likeService;
            _mapper = mapper;
        }
        [Authorize]
        [HttpPut]
        public async Task<IActionResult> ToggleLike([FromBody] CreateLikeDto dto)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                dto.UserId = currentUserId;
                var like = _mapper.Map<Like>(dto);
                var updatedLike = await _likeService.ToggleLikeAsync(like, dto.UserId);

                return Ok(updatedLike);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error toggling like: {ex.Message}");
            }
        }

        
        // [Authorize]
        // [HttpDelete("post/{postId}")]
        // public async Task<IActionResult> DeleteLikeByPost(Guid postId)
        // {
        //     var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //     if (!Guid.TryParse(idClaim, out Guid currentUserId))
        //         return Unauthorized("Invalid user identity.");

        //     var existing = await _likeService.GetLikeByPostAndUser(postId, currentUserId);

        //     if (existing == null || !existing.IsLiked)
        //         return NotFound("Like not found or already removed.");

        //     var deleted = await _likeService.DeleteLike(existing.Id, currentUserId); // You now have LikeId from DB
        //     return Ok(deleted);
        // }


    }
}
