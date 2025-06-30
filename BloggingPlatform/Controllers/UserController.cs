using Microsoft.AspNetCore.Mvc;
using BloggingPlatform.Interfaces;
using AutoMapper;
using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.OpenApi.Extensions;


namespace BloggingPlatform.Controllers.v1
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IPostService _postService;


        public UsersController(IUserService userService, IMapper mapper, IPasswordHasher passwordHasher, IPostService postService)
        {
            _userService = userService;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _postService = postService;

        }

        [HttpGet("getAll")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAll();
            if (users.Count() == 0)
            {
                return NotFound("No users found.");
            }

            return Ok(users);
        }

        [HttpGet("get/{userId}")]
        public async Task<IActionResult> Get(Guid userId)
        {
            var user = await _userService.Get(userId);
                if (user== null|| user.IsDeleted)
            {
                return NotFound($"User not found.");
            }

            return Ok(user);
        }
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedRole = dto.Role.Trim().ToLower();
            Console.WriteLine(normalizedRole);
            Console.WriteLine(string.Equals(normalizedRole,"admin"));
            Console.WriteLine(dto.AdminSecret);
            string role;
            if (string.Equals(normalizedRole, "admin"))
            {
                if (dto.AdminSecret != "adminsecret")
                    return BadRequest("Invalid admin secret provided.");

                role = "Admin";
                Console.WriteLine($"1: {role}");

            }
            else
            {
                role ="User";
                Console.WriteLine($"2: {role}");
            }
            

            var existingUser = await _userService.GetByEmail(dto.Email);
            if (existingUser != null)
            {
                if (existingUser.IsDeleted)
                {
                    _mapper.Map(dto, existingUser);
                    existingUser.Role = role;
                    existingUser.IsDeleted = false;
                    existingUser.PasswordHash = _passwordHasher.HashPassword(dto.Password);

                    var reactivatedUser = await _userService.UpdateUser(existingUser.Id, existingUser);
                    return Ok(new { message = "User was previously deleted. Reactivated and updated.", user = reactivatedUser });
                }

                return Conflict($"A user with email '{dto.Email}' already exists.");
            }

            var user = _mapper.Map<User>(dto);
            user.Role = role;
            Console.WriteLine($"{user.Role}: {role}");
            user.PasswordHash = _passwordHasher.HashPassword(dto.Password);

            var createdUser = await _userService.AddUser(user);

            return CreatedAtAction(nameof(Get), new { version = "1.0", userId = createdUser.Id }, createdUser);
        }
        [Authorize]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UpdateUserDto dto)
        {       
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                // Only allow Admins or the user themselves
                if (role != "Admin" && currentUserId != userId)
                    return Forbid();

                var user = await _userService.Get(currentUserId);
                if (user == null|| user.IsDeleted)
                    return NotFound("User not found.");

                _mapper.Map(dto, user);

                if (!string.IsNullOrEmpty(dto.Password))
                    user.PasswordHash =  _passwordHasher.HashPassword(dto.Password);
                    if (role != "Admin")
                        {
                            dto.Role = user.Role;
                            dto.IsSuspended = user.IsSuspended;
                            dto.SuspensionReason = user.SuspensionReason;
                            dto.SuspendedUntil = user.SuspendedUntil;
                        }


                var updated = await _userService.UpdateUser(currentUserId, user );
                return Ok(updated);
        }
        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Guid.TryParse(id, out Guid currentUserId))
                return Unauthorized("Invalid user identity.");

            if (role != "Admin" && currentUserId != userId)
                return Forbid();

            var existingUser = await _userService.Get(userId);
            if (existingUser == null || existingUser.IsDeleted)
                return NotFound("User not found or already deleted");


            var result = await _userService.DeleteUser(userId);
            return Ok(new { message = $"User deleted." });
        }
        [HttpGet("getPostByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<Post>>> GetPostsByUser(Guid userId)
        {
            try
            {
             var existingUser = await _userService.Get(userId);
            if (existingUser == null || existingUser.IsDeleted)
                return NotFound("User not found or already deleted");

                var posts = await _userService.GetPostByUser(userId);

                if (posts == null || !posts.Any())
                    return NotFound($"No posts found For this user");

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving posts: {ex.Message}");
            }
        }
[HttpGet("getAll/filtered")]
public async Task<ActionResult<IEnumerable<User>>> GetFilteredUsers([FromQuery] string? role,[FromQuery] string? status,[FromQuery] string? sortOrder = "asc",
    [FromQuery] int? pageNumber=1,[FromQuery] int? pageSize=10)
{
    try
    {
        var users = await _userService.GetAllFiltereduser(role, status, sortOrder, pageNumber, pageSize);

        if (!users.Any())
            return NotFound("No users found for the given criteria.");

        return Ok(users);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error fetching users: {ex.Message}");
    }
}

    }

}
