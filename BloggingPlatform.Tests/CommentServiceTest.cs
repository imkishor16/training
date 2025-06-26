using BloggingPlatform.Contexts;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Repositories;
using BloggingPlatform.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests.Services
{
    [TestFixture]
    public class CommentServiceTests
    {
        private BloggingPlatformContext _context = null!;
        private IRepository<Guid, Comment> _commentRepository = null!;
        private Mock<IUserValidationService> _userValidationServiceMock = null!;
        private CommentService _service = null!;

        [SetUp]
        public void Setup()
        {
            // Setup in-memory EF Core context
            var options = new DbContextOptionsBuilder<BloggingPlatformContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new BloggingPlatformContext(options);

            // Use the real repository (not mocked)
            _commentRepository = new CommentRepository(_context);

            // Keep audit log and user validation mocked for simplicity
            _userValidationServiceMock = new Mock<IUserValidationService>();

            _service = new CommentService(
                _commentRepository,
                _userValidationServiceMock.Object
            );
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task AddComment_ShouldAddCommentAndAudit()
        {
            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Content = "Nice!",
                PostId = Guid.NewGuid()
            };
            var performedBy = "admin@example.com";


            var result = await _service.AddComment(comment,comment.UserId);
            Assert.That(result.Id, Is.EqualTo(comment.Id));
            Assert.That(result.Content, Is.EqualTo(comment.Content));
        }

        [Test]
        public void GetCommentById_ThrowsException_WhenCommentIsNull()
        {
            Assert.ThrowsAsync<Exception>(() => _service.GetCommentById(Guid.NewGuid()));
        }

        [Test]
        public async Task UpdateComment_ShouldUpdateContentAndAudit()
        {
            var id = Guid.NewGuid();
            var oldComment = new Comment
            {
                Id = id,
                Content = "Old content",
                UserId = Guid.NewGuid(),
                PostId = Guid.NewGuid()
            };
            await _commentRepository.Add(oldComment);

            var newComment = new Comment { Content = "Updated content" };
            var performedBy = oldComment.UserId;

            _userValidationServiceMock.Setup(v => v.ValidateUser(performedBy)).Returns(Task.CompletedTask);

            var result = await _service.UpdateComment(id, newComment, performedBy);

            _userValidationServiceMock.Verify(v => v.ValidateUser(performedBy), Times.Once);

            Assert.That(result.Content, Is.EqualTo("Updated content"));
        }

        [Test]
        public async Task DeleteComment_ShouldMarkAsDeletedAndAudit()
        {
            var id = Guid.NewGuid();
            var comment = new Comment
            {
                Id = id,
                IsDeleted = false,
                Status = "Active",
                UserId = Guid.NewGuid(),
                PostId = Guid.NewGuid(),
                Content="Hello"

            };
            await _commentRepository.Add(comment);

            var performedBy = comment.UserId;

            _userValidationServiceMock.Setup(v => v.ValidateUser(performedBy)).Returns(Task.CompletedTask);

            var result = await _service.DeleteComment(id, performedBy);

            Assert.That(result.IsDeleted, Is.True);
        }

        [Test]
        public async Task GetFilteredComments_ShouldFilterByPostIdAndStatus()
        {
            var postId1 = Guid.NewGuid();
            var postId2 = Guid.NewGuid();

            var comments = new List<Comment>
            {
                new Comment { Id = Guid.NewGuid(), PostId = postId1, Status = "Approved", IsDeleted = false, UserId = Guid.NewGuid(), Content = "C1" },
                new Comment { Id = Guid.NewGuid(), PostId = postId2, Status = "Deleted", IsDeleted = true, UserId = Guid.NewGuid(), Content = "C2" },
                new Comment { Id = Guid.NewGuid(), PostId = postId1, Status = "Approved", IsDeleted = false, UserId = Guid.NewGuid(), Content = "C3" }
            };

            foreach (var c in comments)
                await _commentRepository.Add(c);

            var result = await _service.GetFilteredComments(
                postId1,
                null, "Approved", "asc", 1, 10);

            Assert.That(result.Count(), Is.EqualTo(2));
            Assert.That(result.All(c => c.Status == "Approved" && !c.IsDeleted), Is.True);
        }
    }
}
