
using BloggingPlatform.Interfaces;
using BloggingPlatform.Services;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using BloggingPlatform.Models;
using BloggingPlatform.Dto.User;
using BloggingPlatform.Dto.RefreshToken;


namespace BloggingPlatform.Controllers
{


    [ApiController]
    [Route("api/v{version:apiVersion}/login")]
    [ApiVersion("1.0")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ILogger<AuthenticationController> _logger;
        private readonly RefreshTokenService _refreshTokenService;
        private readonly IRepository<Guid, User> _userRepository;
        private readonly ITokenService _tokenService;

        public AuthenticationController(IAuthenticationService authenticationService, ILogger<AuthenticationController> logger,
        IRepository<Guid, User> userRepository, ITokenService tokenService, RefreshTokenService refreshTokenService)
        {
            _authenticationService = authenticationService;
            _logger = logger;
            _userRepository = userRepository;
            _refreshTokenService = refreshTokenService;
            _tokenService = tokenService;
        }
        [HttpPost]
        public async Task<ActionResult<UserLoginResponse>> UserLogin(UserLoginRequest loginRequest)
        {

            try
            {
                var result = await _authenticationService.Login(loginRequest);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Unauthorized(e.Message);
            }
        }
        [HttpPost("refresh")]
public async Task<ActionResult<UserLoginResponse>> RefreshToken([FromBody] RefreshTokenRequestDto request)
{
    try
    {
        var refreshToken = await _refreshTokenService.Validate(request.RefreshToken);
        if (refreshToken == null)
            return Unauthorized("Invalid or expired refresh token");

        var user = await _userRepository.Get(refreshToken.UserId);
        if (user == null)
            return Unauthorized("User not found");

        var newAccessToken = await _tokenService.GenerateToken(user);
        var newRefreshToken = _refreshTokenService.GenerateToken();

        await _refreshTokenService.Revoke(request.RefreshToken);
        await _refreshTokenService.SaveToken(newRefreshToken, user.Email,user.Id);

        return Ok(new UserLoginResponse
        {
            Email = user.Email,
            Token = newAccessToken,
            RefreshToken = newRefreshToken
        });
    }
    catch (Exception e)
    {
        _logger.LogError(e, "Error refreshing token");
        return Unauthorized("Could not refresh token");
    }
}

    }
}