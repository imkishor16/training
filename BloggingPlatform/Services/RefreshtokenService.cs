using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using System.Security.Cryptography;
using System;
using System.Threading.Tasks;

namespace BloggingPlatform.Services
{
    public class RefreshTokenService
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public RefreshTokenService(IRefreshTokenRepository refreshTokenRepository)
        {
            _refreshTokenRepository = refreshTokenRepository;
        }

        public virtual string GenerateToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public virtual async Task SaveToken(string token, string userEmail, Guid userId)
        {
            var refreshToken = new RefreshToken
            {
                Token = token,
                UserEmail = userEmail,
                UserId = userId,
                Expires = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            await _refreshTokenRepository.Add(refreshToken);
        }

        public virtual async Task<RefreshToken?> Validate(string token)
        {
                var trimmedToken = token.Trim();

            var stored = await _refreshTokenRepository.GetByToken(trimmedToken);
            if (stored == null || stored.IsRevoked || stored.Expires < DateTime.UtcNow)

                return null;

            return stored;
        }

        public virtual async Task Revoke(string token)
        {
            await _refreshTokenRepository.Revoke(token);
        }
    }
}
