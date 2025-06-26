using BloggingPlatform.Dto.User;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Repositories;

namespace BloggingPlatform.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher _encryptionService;
        private readonly IRepository<Guid, User> _userRepository;

        private readonly ILogger<AuthenticationService> _logger;
        private readonly RefreshTokenService _refreshTokenService;

        public AuthenticationService(ITokenService tokenService,
                              IPasswordHasher encryptionService,
                              UserRepository userRepository, 
                              ILogger<AuthenticationService> logger,
                              RefreshTokenService refreshTokenService)
        {
            _tokenService = tokenService;
            _encryptionService = encryptionService;
            _userRepository = userRepository; 
            _logger = logger;
            _refreshTokenService = refreshTokenService;
        }
        public async Task<UserLoginResponse> Login(UserLoginRequest user)
        {
            var dbUser = await ((UserRepository)_userRepository).GetByEmail(user.Email);
            if (dbUser == null)
            {
                _logger.LogCritical("User not found");
                throw new Exception("No such user");
            }
            bool isPasswordValid = _encryptionService.VerifyPassword(user.Password, dbUser.PasswordHash);
            _logger.LogInformation($"Login attempt: {user.Email}");
            _logger.LogInformation($"User found: {dbUser != null}");
            _logger.LogInformation($"Password valid: {isPasswordValid}");

                if (!isPasswordValid)
            {
                throw new Exception("Invalid credentials");
            }

            var token = await _tokenService.GenerateToken(dbUser);
                var refreshToken = _refreshTokenService.GenerateToken();

                await _refreshTokenService.SaveToken(refreshToken,dbUser.Email ,dbUser.Id);

            return new UserLoginResponse
            {
                Email = user.Email,
                Token = token,
                RefreshToken = refreshToken

            };
        }

        public async Task<bool> Logout(string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Logout attempt with empty refresh token");
                return false;
            }

            try
            {
                await _refreshTokenService.Revoke(refreshToken);
                _logger.LogInformation("User logged out successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return false;
            }
        }
    }
}