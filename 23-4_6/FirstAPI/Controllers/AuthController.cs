using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using FirstAPI.Interfaces;
using FirstAPI.Models;
using System.Security.Claims;
using FirstAPI.Services;

namespace FirstAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IAuthenticationService _authService;
        private readonly IRepository<string, User> _userRepository;
        private readonly IEncryptionService _encryptionService;

        public AuthController(
            ITokenService tokenService, 
            IAuthenticationService authService,
            IRepository<string, User> userRepository,
            IEncryptionService encryptionService)
        {
            _tokenService = tokenService;
            _authService = authService;
            _userRepository = userRepository;
            _encryptionService = encryptionService;
        }

        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(GoogleCallback))
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
            
            if (!result.Succeeded)
                return BadRequest("Google authentication failed");

            var email = result.Principal.FindFirstValue(ClaimTypes.Email);
            var name = result.Principal.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
                return BadRequest("Email not provided by Google authentication");

            try
            {
                var existingUser = await _userRepository.Get(email);
                
                if (existingUser == null)
                {
                    var newUser = new User
                    {
                        Username = email,
                        Role = "Patient", 
                        Password = _encryptionService.GenerateHash(Guid.NewGuid().ToString()),
                        HashKey = _encryptionService.GenerateKey()
                    };

                    await _userRepository.Add(newUser);
                }

                
                var token = _tokenService.GenerateToken(email);
                
                return Ok(new { 
                    token,
                    username = email,
                    message = existingUser == null ? "New user created" : "Existing user logged in"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 