using NUnit.Framework;
using Moq;
using AutoMapper;
using BloggingPlatform.Controllers;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace BloggingPlatform.Tests
{
    [TestFixture]
    public class CommentControllerTests
    {
        private Mock<ICommentService> _mockCommentService;
        private Mock<IMapper> _mockMapper;
        private CommentController _controller;

        [SetUp]
        public void Setup()
        {
            _mockCommentService = new Mock<ICommentService>();
            _mockMapper = new Mock<IMapper>();
            _controller = new CommentController(_mockCommentService.Object, _mockMapper.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Email, "test@example.com"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        [Test]
        public async Task AddComment_ReturnsCreatedResult()
        {
            // Arrange
            var dto = new Dto.Comment.CreateCommentDto();
            var comment = new Comment();
            var createdComment = new Comment { Id = Guid.NewGuid() };
            var userId = Guid.NewGuid(); // Fixed userId

            // Set up User in HttpContext
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            _mockMapper.Setup(m => m.Map<Comment>(dto)).Returns(comment);
            _mockCommentService.Setup(s => s.AddComment(comment, userId)).ReturnsAsync(createdComment);

            // Act
            var result = await _controller.AddComment(dto) as CreatedAtActionResult;

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.StatusCode, Is.EqualTo(201));
            Assert.That(((Comment)result!.Value!).Id, Is.EqualTo(createdComment.Id));
        }

        [Test]
        public async Task GetCommentById_ReturnsComment()
        {
            var commentId = Guid.NewGuid();
            var comment = new Comment { Id = commentId};

            _mockCommentService.Setup(s => s.GetCommentById(commentId)).ReturnsAsync(comment);

            var result = await _controller.GetCommentById(commentId);

    Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
    
    var okResult = result.Result as OkObjectResult;
    Assert.That(okResult?.Value, Is.TypeOf<Comment>());

    var commentval = okResult?.Value as Comment;
            Assert.That(commentval?.Id, Is.EqualTo(commentId));
        }

        [Test]
public async Task UpdateComment_ReturnsOkResult()
{
    // Arrange
    var commentId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Email, "user@example.com")
    };

    var identity = new ClaimsIdentity(claims);
    var claimsPrincipal = new ClaimsPrincipal(identity);

    _controller.ControllerContext = new ControllerContext
    {
        HttpContext = new DefaultHttpContext { User = claimsPrincipal }
    };

    var dto = new UpdateCommentDto(); // Fill this if needed with values

    var existingComment = new Comment { Id = commentId, UserId = userId };
    var updatedComment = new Comment { Id = commentId, UserId = userId };

    _mockCommentService
        .Setup(s => s.GetCommentById(commentId))
        .ReturnsAsync(existingComment);

    _mockMapper
        .Setup(m => m.Map<Comment>(dto))
        .Returns(updatedComment);

    _mockCommentService
        .Setup(s => s.UpdateComment(commentId, updatedComment, userId))
        .ReturnsAsync(updatedComment);

    // Act
    var result = await _controller.UpdateComment(commentId, dto) as OkObjectResult;

    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result!.StatusCode, Is.EqualTo(200));
    Assert.That(((Comment)result.Value!).Id, Is.EqualTo(commentId));
}

        // [Test]
        // public async Task DeleteComment_ReturnsOkResult()
        // {
        //     var commentId = Guid.NewGuid();
        //     var userId = Guid.NewGuid();
        //     var userEmail = _controller.HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
        //     var deletedComment = new Comment { Id = commentId, UserId =userId };

        //     _mockCommentService
        //         .Setup(s => s.GetCommentById(commentId))
        //         .ReturnsAsync(deletedComment);

        //     _mockCommentService
        //         .Setup(s => s.DeleteComment(commentId, userId))
        //         .ReturnsAsync(deletedComment);

        //     var result = await _controller.DeleteComment(commentId) as OkObjectResult;

        //     Assert.That(result, Is.Not.Null, "Expected OkObjectResult but got null.");
        //     Assert.That(((Comment)result.Value).Id, Is.EqualTo(commentId));
        // }

        [Test]
        public async Task DeleteComment_ReturnsOkResult()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, "user@example.com")
            };

            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            var deletedComment = new Comment { Id = commentId, UserId = userId };

            _mockCommentService
                .Setup(s => s.GetCommentById(commentId))
                .ReturnsAsync(deletedComment);

            _mockCommentService
                .Setup(s => s.DeleteComment(commentId, userId))
                .ReturnsAsync(deletedComment);

            // Act
            var result = await _controller.DeleteComment(commentId) as OkObjectResult;

            // Assert
            Assert.That(result, Is.Not.Null, "Expected OkObjectResult but got null.");
            Assert.That(result!.StatusCode, Is.EqualTo(200));
            Assert.That(((Comment)result.Value!).Id, Is.EqualTo(commentId));
        }
        [Test]
        public async Task GetFilteredComments_ReturnsFilteredList()
        {
            var query = new CommentQueryDto();
            var comments = new List<Comment> { new Comment { Id = Guid.NewGuid() } };

            _mockCommentService.Setup(s => s.GetFilteredComments(query.PostId, query.UserId, query.Status, query.SortOrder, query.PageNumber, query.PageSize)).ReturnsAsync(comments);

            var result = await _controller.GetFilteredComments(query) as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            Assert.That(((List<Comment>)result.Value).Count, Is.EqualTo(1));
        }
    }
}
