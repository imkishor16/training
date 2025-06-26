using BloggingPlatform.Contexts;
using BloggingPlatform.Models;
using BloggingPlatform.Repositories;
using BloggingPlatform.Services;
using BloggingPlatform.Interfaces;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;

namespace BloggingPlatform.Tests.Services
{
    public class UserServiceConcreteRepoTests
    {
        private BloggingPlatformContext _context;
        private UserService _userService;
        private UserRepository _userRepository;
        private PostRepository _postRepository;
        private Mock<IUserValidationService> _mockValidationService;


        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<BloggingPlatformContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new BloggingPlatformContext(options);
            _context.Database.EnsureCreated();

            _userRepository = new UserRepository(_context);
            _postRepository = new PostRepository(_context);
            _mockValidationService = new Mock<IUserValidationService>();


            _userService = new UserService(_context, _userRepository, _postRepository, _mockValidationService.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task AddUser_ShouldStoreAndAudit()
        {
            var userId = Guid.Parse("94a587f1-e0b6-4fbb-80f2-256193019d40");
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Name = "Test User",
                Role = "Editor",
                Status = "Active",
                PasswordHash = "password",
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userService.AddUser(user);

            var savedUser = await _userRepository.Get(userId);

            Assert.That(savedUser, Is.Not.Null);
            Assert.That(result.Email, Is.EqualTo(savedUser.Email));
        }

        [Test]
        public async Task GetUser_ShouldGetByEmail()
        {
            var userId = Guid.Parse("94a587f1-e0b6-4fbb-80f2-256193019d40");

            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Name = "Test User",
                Role = "Editor",
                Status = "Active",
                PasswordHash = "password",
                CreatedAt = DateTime.UtcNow
            };

            await _userService.AddUser(user);
            var result = await _userService.Get(userId);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Name, Is.EqualTo("Test User"));
        }

 [Test]
public async Task UpdateUser_UpdatesUserSuccessfully_AndLogsAudit()
{
    var performedBy = "admin@example.com";
    _mockValidationService.Setup(v => v.ValidateUser(It.IsAny<Guid>())).Returns(Task.CompletedTask);

    var userId = Guid.NewGuid();
    var originalUser = new User
    {
        Id = userId,
        Email = "test@example.com",
        Name = "Old Name",
        Role = "Editor",
        Status = "Active",
        PasswordHash = "password",
        CreatedAt = DateTime.UtcNow
    };

    await _userService.AddUser(originalUser);

    var updatedUser = new User
    {
        Id = userId, // important
        Email = "test@example.com",
        Name = "New Name",
        Role = "Editor",
        Status = "Active",
        PasswordHash = "password",
        CreatedAt = DateTime.UtcNow
    };

    var result = await _userService.UpdateUser(userId, updatedUser);

    Assert.That(result.Name, Is.EqualTo("New Name"));
}


        [Test]
public void DeleteUser_NonExistentUser_ThrowsException()
{
    var nonExistentUserId = Guid.NewGuid(); // Prefer this over new Guid()

    var ex = Assert.ThrowsAsync<Exception>(() =>
        _userService.DeleteUser(nonExistentUserId));

    Assert.That(ex.Message, Is.EqualTo("User not found"));
}

        [Test]
public async Task GetPostByUser_ReturnsOnlyPostsOfUser()
{
    var userId = Guid.NewGuid();

    var user = new User
    {
        Id = userId,
        Email = "test@example.com",
        Name = "Test User",
        Role = "Editor",
        Status = "Active",
        PasswordHash = "password",
        CreatedAt = DateTime.UtcNow
    };

    await _userService.AddUser(user);

    _mockValidationService.Setup(v => v.ValidateUser(It.IsAny<Guid>())).Returns(Task.CompletedTask);

    var post1 = new Post
    {
        Id = Guid.NewGuid(),
        UserId = userId,  // Corrected to use UserId
        Title = "Post 1",
        Content = "hello",
    };

    var post2 = new Post
    {
        Id = Guid.NewGuid(),
        UserId = Guid.NewGuid(), // Different user
        Title = "Post 2",
        Content = "hello2",
    };

    await _context.Posts.AddRangeAsync(post1, post2);
    await _context.SaveChangesAsync();

    var result = await _userService.GetPostByUser(userId);

    Assert.That(result.Count(), Is.EqualTo(1));
    Assert.That(result.First().UserId, Is.EqualTo(userId));
}

    }
}
