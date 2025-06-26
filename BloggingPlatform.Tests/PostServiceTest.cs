using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using BloggingPlatform.Repositories;
using BloggingPlatform.Services;
using Moq;
using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[TestFixture]
public class PostServiceTests
{
    private BloggingPlatformContext _context;
    private PostService _postService;
    private IRepository<Guid, Post> _postRepository;
    private IRepository<Guid, Comment> _commentRepository;
    private IRepository<Guid, Image> _imageRepository;
    private IRepository<Guid, User> _userRepository;

    private Mock<IImageService> _imageServiceMock;
    private Mock<IUserValidationService> _userValidationServiceMock;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<BloggingPlatformContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new BloggingPlatformContext(options);
        _context.Database.EnsureCreated();

        _postRepository = new PostRepository(_context);
        _commentRepository = new CommentRepository(_context);
        _imageRepository = new ImageRepository(_context);
        _userRepository = new UserRepository(_context);

        _imageServiceMock = new Mock<IImageService>();
        _userValidationServiceMock = new Mock<IUserValidationService>();

        _postService = new PostService(
            _postRepository,
            _commentRepository,
            _imageRepository,
            (UserRepository)_userRepository,
            _imageServiceMock.Object,
            _context,
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
    public async Task AddPost_ShouldStoreInDb()
    {
        var post = new Post
        {
            Id = Guid.NewGuid(),
            Title = "Test Post",
            Content = "Some content",
            UserId = Guid.NewGuid()
        };

        _userValidationServiceMock.Setup(s => s.ValidateUser(post.UserId)).Returns(Task.CompletedTask);

        var result = await _postService.AddPost(post, post.UserId);

        var fromDb = await _postRepository.Get(result.Id);
        Assert.That(fromDb.Title, Is.EqualTo("Test Post"));
    }
    [Test]
public async Task DeletePost_ShouldMarkPostAsDeleted_AndLogAudit()
{
    // Arrange
    var postId = Guid.NewGuid();
        var UserId = Guid.NewGuid();

    var post = new Post { Id = postId, IsDeleted = false, UserId=UserId ,Title="hello",Content="hello this is a post"};
    
    // Add post to in-memory DB
    await _postRepository.Add(post);

    _userValidationServiceMock.Setup(s => s.ValidateUser(post.UserId)).Returns(Task.CompletedTask);
    
    // Act
    var result = await _postService.DeletePost(postId, post.UserId);

    // Fetch fresh from DB
    var updatedPost = await _postRepository.Get(postId);

    // Assert
    Assert.That(updatedPost.IsDeleted, Is.True);
    Assert.That(result.IsDeleted, Is.True);
}

[Test]
public async Task GetPostById_ShouldReturnPost()
{
    // Arrange
    var postId = Guid.NewGuid();
    var post = new Post { Id = postId, Title = "Sample Title" ,UserId=Guid.NewGuid(),Content="hello this is a post"};

    await _postRepository.Add(post);

    // Act
    var result = await _postService.GetPostByID(postId);

    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result.Id, Is.EqualTo(postId));
    Assert.That(result.Title, Is.EqualTo("Sample Title"));
}

[Test]
public async Task UpdatePost_ShouldReturnUpdatedValue()
{
    // Arrange
    var postId = Guid.NewGuid();
    var post = new Post { Id = postId, Content = "hello", UserId=Guid.NewGuid() ,Title="Post"};
    await _postRepository.Add(post);

    // Act
    var postToUpdate = await _postRepository.Get(postId);
    postToUpdate.Content = "changed";
    await _postRepository.Update(postId, postToUpdate);

    var updatedPost = await _postService.GetPostByID(postId);

    // Assert
    Assert.That(updatedPost.Content, Is.EqualTo("changed"));
}

}
