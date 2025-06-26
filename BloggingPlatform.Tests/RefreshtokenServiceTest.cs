using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Services;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests
{
    [TestFixture]
    public class RefreshTokenServiceTests
    {
        private Mock<IRefreshTokenRepository> _refreshTokenRepoMock = null!;
        private RefreshTokenService _refreshTokenService = null!;

        [SetUp]
        public void SetUp()
        {
            _refreshTokenRepoMock = new Mock<IRefreshTokenRepository>();
            _refreshTokenService = new RefreshTokenService(_refreshTokenRepoMock.Object);
        }

        [Test]
        public void GenerateToken_ReturnsBase64String()
        {
            // Act
            var token = _refreshTokenService.GenerateToken();

            // Assert
            Assert.That(token, Is.Not.Null.And.Not.Empty);
            Assert.That(() => Convert.FromBase64String(token), Throws.Nothing); // valid base64
        }

        [Test]
        public async Task SaveToken_CallsRepositoryWithValidData()
        {
            // Arrange
            string email = "user@example.com";
            string token = "generated-token";
            Guid userId = Guid.NewGuid();
            RefreshToken? savedToken = null;

            _refreshTokenRepoMock
                .Setup(r => r.Add(It.IsAny<RefreshToken>()))
                .Callback<RefreshToken>(rt => savedToken = rt)
                .Returns(Task.CompletedTask);

            // Act
            await _refreshTokenService.SaveToken(token, email,userId);

            // Assert
            Assert.That(savedToken, Is.Not.Null);
            Assert.That(savedToken!.Token, Is.EqualTo(token));
            Assert.That(savedToken.UserEmail, Is.EqualTo(email));
            Assert.That(savedToken.Expires, Is.GreaterThan(DateTime.UtcNow));
            Assert.That(savedToken.IsRevoked, Is.False);
        }

        [Test]
        public async Task Validate_ReturnsNull_WhenTokenIsNotFound()
        {
            // Arrange
            _refreshTokenRepoMock.Setup(r => r.GetByToken("invalid-token"))
                                 .ReturnsAsync((RefreshToken?)null);

            // Act
            var result = await _refreshTokenService.Validate("invalid-token");

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task Validate_ReturnsNull_WhenTokenIsRevokedOrExpired()
        {
            // Arrange
            var expiredToken = new RefreshToken
            {
                Token = "expired",
                Expires = DateTime.UtcNow.AddDays(-1),
                IsRevoked = false
            };

            var revokedToken = new RefreshToken
            {
                Token = "revoked",
                Expires = DateTime.UtcNow.AddDays(1),
                IsRevoked = true
            };

            _refreshTokenRepoMock.Setup(r => r.GetByToken("expired")).ReturnsAsync(expiredToken);
            _refreshTokenRepoMock.Setup(r => r.GetByToken("revoked")).ReturnsAsync(revokedToken);

            // Act & Assert
            var result1 = await _refreshTokenService.Validate("expired");
            var result2 = await _refreshTokenService.Validate("revoked");

            Assert.That(result1, Is.Null);
            Assert.That(result2, Is.Null);
        }

        [Test]
        public async Task Validate_ReturnsToken_WhenValid()
        {
            // Arrange
            var validToken = new RefreshToken
            {
                Token = "valid",
                Expires = DateTime.UtcNow.AddDays(1),
                IsRevoked = false
            };

            _refreshTokenRepoMock.Setup(r => r.GetByToken("valid")).ReturnsAsync(validToken);

            // Act
            var result = await _refreshTokenService.Validate("valid");

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Token, Is.EqualTo("valid"));
        }

        [Test]
        public async Task Revoke_CallsRepositoryRevoke()
        {
            // Arrange
            string token = "token-to-revoke";
            bool revokeCalled = false;

            _refreshTokenRepoMock.Setup(r => r.Revoke(token))
                                 .Callback(() => revokeCalled = true)
                                 .Returns(Task.CompletedTask);

            // Act
            await _refreshTokenService.Revoke(token);

            // Assert
            Assert.That(revokeCalled, Is.True);
        }
    }
}
