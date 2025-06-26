using AutoMapper;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BloggingPlatform.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace BloggingPlatform.Controllers.v1
{
[ApiController]
[Route("api/v{version:apiVersion}/posts")]
[ApiVersion("1.0")]
public class PostController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;
private readonly IHubContext<PostHub> _hubContext;

        public PostController(IPostService postService, IMapper mapper, IImageService imageService, IHubContext<PostHub> hubContext)
        {
            _postService = postService;
            _mapper = mapper;
            _imageService = imageService;
            _hubContext = hubContext;
        }
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromForm] CreatePostDto dto)
    {
        try
        {
            Console.WriteLine($"dto { dto} " );
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
                Console.WriteLine($"{idClaim},{role},{dto.UserId}");
            if (!Guid.TryParse(idClaim, out Guid currentUserId))
                return Unauthorized("Invalid user identity.");


            if (role != "Admin" && currentUserId != dto.UserId)
                return Forbid();


            await _hubContext.Clients.All.SendAsync("ReceivePost",dto);

            var post = _mapper.Map<Post>(dto);
            var created = await _postService.AddPost(post, dto.UserId);
            post.Images = await _imageService.SaveImagesAsync(dto.Images, created.Id, dto.UserId);


            return CreatedAtAction(nameof(GetPostById), new { version = "1.0", id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(Guid id)
    {
        try
        {
            var post = await _postService.GetPostByID(id);
            var images = await _postService.GetImagesByPostId(post.Id);
            post.Images = images.ToList();
            var likes = await _postService.GetLikesByPostId(post.Id);
            post.Likes = likes.ToList();
            if (post == null || post.IsDeleted)
                    return NotFound("Post not found");

            return Ok(post);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetAllPosts()
    {
        var posts = await _postService.GetAllPosts();
        return Ok(posts);
    }
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromForm] UpdatePostDto dto)
    {
        try
        {
                var post = await _postService.GetPostByID(id);
                if (post == null || post.IsDeleted)
                    return NotFound("Post not found");


                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                if (role != "Admin" && currentUserId != post.UserId)
                    return Forbid();

            var updatedPost = _mapper.Map<Post>(dto);
            updatedPost.Id = id;

            var result = await _postService.UpdatePost(id, post.UserId, updatedPost, dto.Images);
            if (result == null)
                return NotFound($"Post with ID {id} not found");

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        try
        {
            var post = await _postService.GetPostByID(id);
            if (post == null || post.IsDeleted)
                return NotFound("Post already deleted");

                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

            var result = await _postService.DeletePost(id, post.UserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetCommentsByPost(Guid id)
    {
        try
        {
            var postExists = await _postService.GetPostByID(id);
            if (postExists == null|| postExists.IsDeleted)
                return NotFound("No such post in the database");

            var comments = await _postService.GetCommentSByPost(id);
            if (!comments.Any())
                return NotFound("No comments in the database");

            return Ok(comments);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/images")]
    public async Task<IActionResult> GetImagesByPost(Guid id)
    {
        try
        {
            var postExists = await _postService.GetPostByID(id);
            if (postExists == null||postExists.IsDeleted)
                return NotFound("No such post in the database");

            var images = await _postService.GetImagesByPostId(id);
            return Ok(images);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("filter")]
    public async Task<IActionResult> GetFilteredPosts([FromQuery] PostQueryDto query)
    {
        try
        {
            var posts = await _postService.GetFilteredPosts(
                query.UserId, query.Status, query.SearchTerm,
                query.SortOrder, query.PageNumber, query.PageSize);

            if (!posts.Any())
                return NotFound("No posts found.");

            return Ok(posts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/likes")]
    public async Task<IActionResult> GetLikesByPostId(Guid id)
    {
        try
        {
            var likes = await _postService.GetLikesByPostId(id);
            return Ok(likes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    }
}
