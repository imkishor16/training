using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Services;
using Microsoft.AspNetCore.Http;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests
{
    [TestFixture]
    public class ImageServiceTests
    {
        private Mock<IRepository<Guid, Image>> _imageRepoMock;
        private ImageService _imageService;

        [SetUp]
        public void Setup()
        {
            _imageRepoMock = new Mock<IRepository<Guid, Image>>();
            _imageService = new ImageService(_imageRepoMock.Object);
        }

        private IFormFile CreateFakeFile(string name, string content)
        {
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            return new FormFile(stream, 0, stream.Length, name, name)
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/png"
            };
        }

        [Test]
        public async Task SaveImagesAsync_ShouldSaveImagesAndLogAudit()
        {
            // Arrange
            var postId = Guid.NewGuid();
            var email = "chechi@example.com";
            var UserId = Guid.NewGuid();
            var files = new List<IFormFile> { CreateFakeFile("test.png", "fake image content") };

            _imageRepoMock.Setup(r => r.Add(It.IsAny<Image>())).ReturnsAsync((Image img) => img);

            // Act
            var result = await _imageService.SaveImagesAsync(files, postId, UserId);

            // Assert
            Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result[0].Name, Is.EqualTo("test.png"));
            Assert.That(result[0].PostId, Is.EqualTo(postId));

        }

        [Test]
        public async Task UpdateImagesAsync_ShouldDeleteOldImagesAndSaveNewOnes()
        {
            // Arrange
            var postId = Guid.NewGuid();
            var email = "chechi@example.com";
            var newFiles = new List<IFormFile> { CreateFakeFile("updated.png", "new content") };
            var UserId = Guid.NewGuid();


            var oldImages = new List<Image> { new Image { Id = Guid.NewGuid(), PostId = postId } };
            _imageRepoMock.Setup(r => r.GetAll()).ReturnsAsync(oldImages);
            _imageRepoMock.Setup(r => r.Delete(It.IsAny<Guid>()))
              .ReturnsAsync((Guid id) => new Image { Id = id, Name = "deleted.png", PostId = Guid.NewGuid() });
            _imageRepoMock.Setup(r => r.Add(It.IsAny<Image>())).ReturnsAsync((Image img) => img);

            // Act
            var result = await _imageService.UpdateImagesAsync(newFiles, postId, UserId);

            // Assert
            Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result[0].Name, Is.EqualTo("updated.png"));

        }

        [Test]
        public async Task DeleteImagesByPostIdAsync_ShouldMarkImagesAsDeleted()
        {
            // Arrange
            var postId = Guid.NewGuid();
            var email = "chechi@example.com";
            var UserId = Guid.NewGuid();

            var images = new List<Image>
            {
                new Image { Id = Guid.NewGuid(), PostId = postId, IsDeleted = false },
                new Image { Id = Guid.NewGuid(), PostId = postId, IsDeleted = true }
            };

            _imageRepoMock.Setup(r => r.GetAll()).ReturnsAsync(images);
            _imageRepoMock.Setup(r => r.Update(It.IsAny<Guid>(), It.IsAny<Image>())).ReturnsAsync((Guid id, Image img) => img);


            // Act
            await _imageService.DeleteImagesByPostIdAsync(postId, UserId);

            // Assert
            _imageRepoMock.Verify(r => r.Update(It.IsAny<Guid>(), It.Is<Image>(img => img.IsDeleted)), Times.Once);
        }
    }
}
