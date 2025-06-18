using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using System.Security.Claims;
using BloggingPlatform.Dto.Comment;


namespace BloggingPlatform.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/comments")]
    [ApiVersion("1.0")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly IMapper _mapper;

        public CommentController(ICommentService commentService, IMapper mapper)
        {
            _commentService = commentService;
            _mapper = mapper;
        }
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                // // Only allow Admins or the user themselves
                // if (role != "Admin" && currentUserId != dto.UserId)
                //     return Forbid();

                dto.UserId = currentUserId;
                var comment = _mapper.Map<Comment>(dto);
                var created = await _commentService.AddComment(comment, dto.UserId);
                return CreatedAtAction(nameof(AddComment), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding comment: {ex.Message}");
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetCommentById(Guid id)
        {
            try
            {
                var comment = await _commentService.GetCommentById(id);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentDto dto)
        {
            try
            {
                var existing = await _commentService.GetCommentById(id);
                if (existing == null||existing.IsDeleted) {
                    return NotFound("no such comment");
                }

                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                if (role != "Admin" && currentUserId != existing.UserId)
                    return Forbid();

                var comment = _mapper.Map<Comment>(dto);
                var updated = await _commentService.UpdateComment(id, comment, existing.UserId);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating comment: {ex.Message}");
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredComments([FromQuery] CommentQueryDto query)
        {
            try
            {
                var comments = await _commentService.GetFilteredComments(query.PostId,query.UserId, query.Status, query.SortOrder, query.PageNumber, query.PageSize);
                if (comments.Count()== 0)
                {
                    return NotFound("no comments in the gven category");
                }
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching comments: {ex.Message}");
            }
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            try
            {
                var existing = await _commentService.GetCommentById(id);
                if (existing == null||existing.IsDeleted) {
                    return NotFound("no such comment");
                }

                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");


                var deleted = await _commentService.DeleteComment(id, existing.UserId);
                return Ok(deleted);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting comment: {ex.Message}");
            }
        }

    }
}
