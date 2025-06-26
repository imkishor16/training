using BloggingPlatform.Controllers;
using BloggingPlatform.Dto.User;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests.Controllers
{
    public class AuthenticationControllerTests
    {
        private Mock<IAuthenticationService> _authServiceMock = null!;
        private Mock<ILogger<AuthenticationController>> _loggerMock = null!;
        private Mock<IRepository<Guid, User>> _userRepositoryMock = null!;
        private Mock<RefreshTokenService> _refreshTokenServiceMock = null!;
        private Mock<ITokenService> _tokenServiceMock = null!;
        private AuthenticationController _controller = null!;

        [SetUp]
        public void Setup()
        {
            _authServiceMock = new Mock<IAuthenticationService>();
            _loggerMock = new Mock<ILogger<AuthenticationController>>();
            _userRepositoryMock = new Mock<IRepository<Guid, User>>();
            _refreshTokenServiceMock = new Mock<RefreshTokenService>(Mock.Of<IRefreshTokenRepository>()) { CallBase = true };
            _tokenServiceMock = new Mock<ITokenService>();

            _controller = new AuthenticationController(
                _authServiceMock.Object,
                _loggerMock.Object,
                _userRepositoryMock.Object,
                _tokenServiceMock.Object,
                _refreshTokenServiceMock.Object
            );
        }

        [Test]
        public async Task UserLogin_ValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var request = new UserLoginRequest
            {
                Email = "user@example.com",
                Password = "password"
            };

            var response = new Dto.User.UserLoginResponse
            {
                Email = "user@example.com",
                Token = "jwt-token",
                RefreshToken = "refresh-token"
            };

            _authServiceMock.Setup(x => x.Login(request)).ReturnsAsync(response);

            // Act
            var actionResult = await _controller.UserLogin(request);
            //Assert
            Assert.That(actionResult.Result, Is.TypeOf<OkObjectResult>());

            var okResult = actionResult.Result as OkObjectResult;
            var value = okResult!.Value as Dto.User.UserLoginResponse;

            Assert.That(value!.Email, Is.EqualTo("user@example.com"));
            Assert.That(value.Token, Is.EqualTo("jwt-token"));
        }

        [Test]
        public async Task RefreshToken_ValidToken_ReturnsNewToken()
        {
            var refreshTokenStr = "valid-token";
            var userEmail = "user@example.com";
            var userId = Guid.Parse("94a587f1-e0b6-4fbb-80f2-256193019d40");


            var refreshToken = new RefreshToken
            {
                Token = refreshTokenStr,
                UserEmail = userEmail,
                UserId=userId,
                Expires = DateTime.UtcNow.AddDays(1),
                IsRevoked = false
            };

            var user = new User
            {
                Id = userId,
                Email = userEmail,
                Name = "Test User",
                Role = "User"
            };

            var request = new Dto.RefreshToken.RefreshTokenRequestDto
            {
                RefreshToken = refreshTokenStr
            };

            _refreshTokenServiceMock.Setup(r => r.Validate(refreshTokenStr)).ReturnsAsync(refreshToken);
            _userRepositoryMock.Setup(r => r.Get(userId)).ReturnsAsync(user);
            _tokenServiceMock.Setup(t => t.GenerateToken(user)).ReturnsAsync("new-access-token");
            _refreshTokenServiceMock.Setup(r => r.GenerateToken()).Returns("new-refresh-token");
            _refreshTokenServiceMock.Setup(r => r.Revoke(refreshTokenStr)).Returns(Task.CompletedTask);
            _refreshTokenServiceMock.Setup(r => r.SaveToken("new-refresh-token", userEmail,userId)).Returns(Task.CompletedTask);

            // Act
            var actionResult = await _controller.RefreshToken(request);

            // Assert

                Assert.That(actionResult.Result, Is.TypeOf<OkObjectResult>());

                var okResult = actionResult.Result as OkObjectResult;
                var value = okResult!.Value as UserLoginResponse;

            Assert.That(value!.Token, Is.EqualTo("new-access-token"));
            Assert.That(value.RefreshToken, Is.EqualTo("new-refresh-token"));
        }
    }
}
