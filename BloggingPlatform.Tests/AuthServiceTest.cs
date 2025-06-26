using BloggingPlatform.Contexts;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Repositories;
using BloggingPlatform.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests
{
    [TestFixture]
    public class AuthenticationServiceTests_RealRepo
    {
        private BloggingPlatformContext _context = null!;
        private IRepository<Guid, User> _userRepository = null!;
        private Mock<ITokenService> _tokenServiceMock = null!;
        private Mock<IPasswordHasher> _passwordHasherMock = null!;
private Mock<RefreshTokenService> _refreshTokenServiceMock = null!;
        private ILogger<AuthenticationService> _logger = null!;
        private AuthenticationService _authService = null!;


        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<BloggingPlatformContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new BloggingPlatformContext(options);

            _userRepository = new UserRepository(_context);

            _tokenServiceMock = new Mock<ITokenService>();
            _passwordHasherMock = new Mock<IPasswordHasher>();
             var _refreshTokenRepository = new Mock<IRefreshTokenRepository>();
             _refreshTokenRepository.Setup(r => r.Add(It.IsAny<RefreshToken>())).Returns(Task.CompletedTask);
            _refreshTokenRepository.Setup(r => r.GetByToken(It.IsAny<string>())).ReturnsAsync((RefreshToken?)null);
            _refreshTokenRepository.Setup(r => r.Revoke(It.IsAny<string>())).Returns(Task.CompletedTask);


_refreshTokenServiceMock = new Mock<RefreshTokenService>(_refreshTokenRepository.Object) { CallBase = true };
_refreshTokenServiceMock.Setup(r => r.GenerateToken()).Returns("mock-refresh");
            _logger = new LoggerFactory().CreateLogger<AuthenticationService>();

            _authService = new AuthenticationService(
                _tokenServiceMock.Object,
                _passwordHasherMock.Object,
                (UserRepository)_userRepository,
                _logger,
_refreshTokenServiceMock.Object            );
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task Login_ValidCredentials_ReturnsTokenResponse()
        {
            // Arrange
            var email = "realuser@example.com";
            var password = "mypassword";
            var hashedPassword = "encrypted";

            var user = new User
            {
                Id=Guid.NewGuid(),
                Email = email,
                PasswordHash = hashedPassword,
                Name = "Real User",
            };

            // Add user to in-memory DB
            await _userRepository.Add(user);

            _passwordHasherMock.Setup(h => h.VerifyPassword(password, hashedPassword)).Returns(true);
            _tokenServiceMock.Setup(t => t.GenerateToken(It.IsAny<User>())).ReturnsAsync("real-token");
            _refreshTokenServiceMock.Setup(r => r.GenerateToken()).Returns("real-refresh");
            _refreshTokenServiceMock.Setup(r => r.SaveToken("real-refresh", email,user.Id)).Returns(Task.CompletedTask);

            var request = new UserLoginRequest { Email = email, Password = password };

            // Act
            var result = await _authService.Login(request);

            // Assert
            Assert.That(result.Email, Is.EqualTo(email));
            Assert.That(result.Token, Is.EqualTo("real-token"));
            Assert.That(result.RefreshToken, Is.EqualTo("real-refresh"));
        }

        [Test]
        public void Login_UserNotFound_ThrowsException()
        {
            var request = new UserLoginRequest { Email = "nonexistent@example.com", Password = "irrelevant" };

            var ex = Assert.ThrowsAsync<Exception>(() => _authService.Login(request));
            Assert.That(ex.Message, Is.EqualTo("No such user"));
        }

        [Test]
        public async Task Login_InvalidPassword_ThrowsException()
        {
            var email = "user2@example.com";
            var hashedPassword = "correcthash";

            var user = new User
            {
                Email = email,
                PasswordHash = hashedPassword,
                Name = "Fail User"
            };

            await _userRepository.Add(user);

            _passwordHasherMock.Setup(h => h.VerifyPassword("wrongpass", hashedPassword)).Returns(false);

            var request = new UserLoginRequest
            {
                Email = email,
                Password = "wrongpass"
            };

            var ex = Assert.ThrowsAsync<Exception>(() => _authService.Login(request));
            Assert.That(ex.Message, Is.EqualTo("Invalid credentials"));
        }
    }
}
