
// using FirstAPI.Interfaces;
// using FirstAPI.Models.DTOs.DoctorSpecialities;
// using Microsoft.AspNetCore.Mvc;


// namespace FirstAPI.Controllers
// {


//     [ApiController]
//     [Route("/api/[controller]")]
//     public class AuthenticationController : ControllerBase
//     {
//         private readonly Interfaces.IAuthenticationService _authenticationService;
//         private readonly ILogger<AuthenticationController> _logger;

//         public AuthenticationController(IAuthenticationService authenticationService, ILogger<AuthenticationController> logger)
//         {
//             _authenticationService = authenticationService;
//             _logger = logger;
//         }
//         [HttpPost]
//         public async Task<ActionResult<UserLoginResponse>> UserLogin(UserLoginRequest loginRequest)
//         {
//             try
//             {
//                 var result = await _authenticationService.Login(loginRequest);
//                 return Ok(result);
//             }
//             catch (Exception e)
//             {
//                 _logger.LogError(e.Message);
//                 return Unauthorized(e.Message);
//             }
//         }
//     }
// }


using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using FirstAPI.Interfaces;
using System.Security.Claims;

namespace FirstAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IAuthenticationService _authService;

        public AuthenticationController(ITokenService tokenService, IAuthenticationService authService)
        {
            _tokenService = tokenService;
            _authService = authService;
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

            // Here you would typically:
            // 1. Check if the user exists in your database
            // 2. Create the user if they don't exist
            // 3. Generate a JWT token for subsequent requests

            var token = _tokenService.GenerateToken(email);
            
            return Ok(new { token });
        }
    }
} 