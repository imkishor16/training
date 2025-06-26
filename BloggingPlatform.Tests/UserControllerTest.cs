using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using BloggingPlatform.Controllers.v1;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace BloggingPlatform.Tests.Controllers
{
    [TestFixture]
    public class UsersControllerTests
    {
        private UsersController _controller = null!;
        private Mock<IUserService> _userServiceMock = null!;
        private Mock<IMapper> _mapperMock = null!;
        private Mock<IPasswordHasher> _passwordHasherMock = null!;
        private Mock<IPostService> _postServiceMock = null!;

        [SetUp]
        public void Setup()
        {
            _userServiceMock = new Mock<IUserService>();
            _mapperMock = new Mock<IMapper>();
            _passwordHasherMock = new Mock<IPasswordHasher>();
            _postServiceMock = new Mock<IPostService>();

            _controller = new UsersController(
                _userServiceMock.Object,
                _mapperMock.Object,
                _passwordHasherMock.Object,
                _postServiceMock.Object
            );
        }

        [Test]
        public async Task GetAll_ReturnsOk_WhenUsersExist()
        {
            var users = new List<User> { new User { Email = "test@example.com" } };
            _userServiceMock.Setup(s => s.GetAll()).ReturnsAsync(users);

            var result = await _controller.GetAll();

            Assert.That(result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetAll_ReturnsNotFound_WhenNoUsersExist()
        {
            _userServiceMock.Setup(s => s.GetAll()).ReturnsAsync(new List<User>());
            var result = await _controller.GetAll();
            Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task Get_ReturnsOk_WhenUserExists()
        {
            var id = Guid.NewGuid();
            _userServiceMock.Setup(s => s.Get(id)).ReturnsAsync(new User { Id = id });

            var result = await _controller.Get(id);

            Assert.That(result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task Get_ReturnsNotFound_WhenUserDoesNotExist()
        {
            _userServiceMock.Setup(s => s.Get(It.IsAny<Guid>())).ReturnsAsync((User?)null);

            var result = await _controller.Get(Guid.NewGuid());

            Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateUser_ReturnsBadRequest_WhenAdminSecretInvalid()
        {
            var dto = new CreateUserDto { Role = "admin", AdminSecret = "wrong" };
            var result = await _controller.CreateUser(dto);
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task CreateUser_ReturnsConflict_WhenUserExists()
        {
            var dto = new CreateUserDto { Email = "test@example.com", Role = "user" };
            _userServiceMock.Setup(s => s.GetByEmail(dto.Email)).ReturnsAsync(new User { Email = dto.Email });
            var result = await _controller.CreateUser(dto);
            Assert.That(result, Is.TypeOf<ConflictObjectResult>());
        }

        [Test]
        public async Task CreateUser_ReturnsCreatedAt_WhenUserIsCreated()
        {
            var dto = new CreateUserDto { Email = "new@example.com", Role = "user", Password = "pass" };
            var user = new User { Id = Guid.NewGuid(), Email = dto.Email };

            _userServiceMock.Setup(s => s.GetByEmail(dto.Email)).ReturnsAsync((User?)null);
            _mapperMock.Setup(m => m.Map<User>(dto)).Returns(user);
            _passwordHasherMock.Setup(p => p.HashPassword(dto.Password)).Returns("hashed");
            _userServiceMock.Setup(s => s.AddUser(user)).ReturnsAsync(user);

            var result = await _controller.CreateUser(dto);
            Assert.That(result, Is.TypeOf<CreatedAtActionResult>());
        }

        [Test]
        public async Task UpdateUser_ReturnsOk_WhenSuccessful()
        {
            var userId = Guid.NewGuid();
            var dto = new UpdateUserDto { Name = "Updated", Password = "pass" };
            var user = new User { Id = userId };

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "Admin")
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };

            _userServiceMock.Setup(s => s.Get(userId)).ReturnsAsync(user);
            _mapperMock.Setup(m => m.Map(dto, user));
            _passwordHasherMock.Setup(p => p.HashPassword(dto.Password)).Returns("hashed");
            _userServiceMock.Setup(s => s.UpdateUser(userId, user)).ReturnsAsync(user);

            var result = await _controller.UpdateUser(userId, dto);
            Assert.That(result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task DeleteUser_ReturnsOk_WhenSuccessful()
        {
            var userId = Guid.NewGuid();
            var user = new User { Id = userId };

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "Admin")
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };

            _userServiceMock.Setup(s => s.Get(userId)).ReturnsAsync(user);
            _userServiceMock.Setup(s => s.DeleteUser(userId)).ReturnsAsync(user);

            var result = await _controller.DeleteUser(userId);
            Assert.That(result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetPostsByUser_ReturnsOk_WhenPostsExist()
        {
            var userId = Guid.NewGuid();
            var user = new User { Id = userId };
            var posts = new List<Post> { new Post { Id = Guid.NewGuid(), UserId = userId } };

            _userServiceMock.Setup(s => s.Get(userId)).ReturnsAsync(user);
            _userServiceMock.Setup(s => s.GetPostByUser(userId)).ReturnsAsync(posts);

            var result = await _controller.GetPostsByUser(userId);
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetFilteredUsers_ReturnsOk_WhenUsersFound()
        {
            var users = new List<User> { new User { Email = "test@example.com" } };
            _userServiceMock.Setup(s => s.GetAllFiltereduser(null, null, "asc", 1, 10)).ReturnsAsync(users);

            var result = await _controller.GetFilteredUsers(null, null);
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetFilteredUsers_ReturnsNotFound_WhenEmpty()
        {
            _userServiceMock.Setup(s => s.GetAllFiltereduser(null, null, "asc", 1, 10)).ReturnsAsync(new List<User>());

            var result = await _controller.GetFilteredUsers(null, null);
            Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        }
    }
}
