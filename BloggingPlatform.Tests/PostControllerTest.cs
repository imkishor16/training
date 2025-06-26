using AutoMapper;
using BloggingPlatform.Controllers.v1;
using BloggingPlatform.Hubs;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests.Controllers
{
    [TestFixture]
    public class PostControllerTests
    {
        private Mock<IPostService> _postServiceMock = null!;
        private Mock<IMapper> _mapperMock = null!;
        private Mock<IImageService> _imageServiceMock = null!;
        private Mock<IHubContext<PostHub>> _hubContextMock = null!;
        private Mock<IClientProxy> _clientProxyMock = null!;
        private PostController _controller = null!;

        [SetUp]
        public void Setup()
        {
            _postServiceMock = new Mock<IPostService>();
            _mapperMock = new Mock<IMapper>();
            _imageServiceMock = new Mock<IImageService>();
            _hubContextMock = new Mock<IHubContext<PostHub>>();
            _clientProxyMock = new Mock<IClientProxy>();

            var clientsMock = new Mock<IHubClients>();
            clientsMock.Setup(c => c.All).Returns(_clientProxyMock.Object);
            _hubContextMock.Setup(h => h.Clients).Returns(clientsMock.Object);

            _controller = new PostController(_postServiceMock.Object, _mapperMock.Object, _imageServiceMock.Object, _hubContextMock.Object);
        }

        private void SetUserContext(Guid userId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            };

            var identity = new ClaimsIdentity(claims);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            };
        }

        [Test]
        public async Task GetPostById_ReturnsOk_WhenPostExists()
        {
            var postId = Guid.NewGuid();
            var post = new Post { Id = postId, Images = new List<Image>() };
            _postServiceMock.Setup(s => s.GetPostByID(postId)).ReturnsAsync(post);
            _postServiceMock.Setup(s => s.GetImagesByPostId(postId)).ReturnsAsync(new List<Image>());

            var result = await _controller.GetPostById(postId);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task GetPostById_ReturnsNotFound_WhenPostIsNull()
        {
            var postId = Guid.NewGuid();
            _postServiceMock.Setup(s => s.GetPostByID(postId)).ReturnsAsync((Post)null);

            var result = await _controller.GetPostById(postId);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task DeletePost_ReturnsOk_WhenSuccessful()
        {
            var postId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var post = new Post { Id = postId, UserId = userId };
            SetUserContext(userId, "Admin");

            _postServiceMock.Setup(s => s.GetPostByID(postId)).ReturnsAsync(post);
            _postServiceMock.Setup(s => s.DeletePost(postId, userId)).ReturnsAsync(post);

            var result = await _controller.DeletePost(postId);
            Assert.That(result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetAllPosts_ReturnsPosts()
        {
            _postServiceMock.Setup(s => s.GetAllPosts()).ReturnsAsync(new List<Post>());
            var result = await _controller.GetAllPosts();
            Assert.That(result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetCommentsByPost_ReturnsOk_WhenCommentsExist()
        {
            var postId = Guid.NewGuid();
            _postServiceMock.Setup(p => p.GetPostByID(postId)).ReturnsAsync(new Post());
            _postServiceMock.Setup(p => p.GetCommentSByPost(postId)).ReturnsAsync(new List<Comment> { new Comment() });

            var result = await _controller.GetCommentsByPost(postId);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

       
        [Test]
        public async Task CreatePost_ReturnsCreated_WhenValid()
        {
            var userId = Guid.NewGuid();
            SetUserContext(userId, "Admin");

            var dto = new CreatePostDto { UserId = userId };
            var post = new Post { Id = Guid.NewGuid() };

            _mapperMock.Setup(m => m.Map<Post>(dto)).Returns(post);
            _postServiceMock.Setup(p => p.AddPost(It.IsAny<Post>(), userId)).ReturnsAsync(post);
            _imageServiceMock.Setup(i => i.SaveImagesAsync(dto.Images, post.Id, userId)).ReturnsAsync(new List<Image>());

            var result = await _controller.CreatePost(dto);

            Assert.That(result, Is.InstanceOf<CreatedAtActionResult>());
        }
    }
}
