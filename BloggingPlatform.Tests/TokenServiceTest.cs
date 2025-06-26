using BloggingPlatform.Models;
using BloggingPlatform.Services;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BloggingPlatform.Tests
{
    [TestFixture]
    public class TokenServiceTests
    {
        private TokenService _tokenService = null!;

        [SetUp]
        public void Setup()
        {
            // Create mock configuration
            var inMemorySettings = new Dictionary<string, string> {
                {"Keys:JwtTokenKey", "thisisaverysecretkeyusedfortestingonly123!"}
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _tokenService = new TokenService(configuration);
        }

        [Test]
        public async Task GenerateToken_ValidUser_ReturnsValidJwt()
        {
            // Arrange
            var user = new User
            {
                Name = "Test User",
                Email = "test@example.com",
                Role = "Admin"
            };

            // Act
            var token = await _tokenService.GenerateToken(user);


            // Assert basic format
            Assert.That(token, Is.Not.Null.And.Not.Empty);

            // Decode the token
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
                        foreach (var claim in jwtToken.Claims)
{
    Console.WriteLine($"Type: {claim.Type}, Value: {claim.Value}");
}


            Assert.That(jwtToken, Is.Not.Null);
            Assert.That(jwtToken.Claims, Is.Not.Empty);
            Assert.That(jwtToken.ValidTo, Is.GreaterThan(DateTime.UtcNow));

            // Assert claims
            var nameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "unique_name")?.Value;
            var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
            var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "role")?.Value;

            Assert.That(nameClaim, Is.EqualTo("Test User"));
            Assert.That(emailClaim, Is.EqualTo("test@example.com"));
            Assert.That(roleClaim, Is.EqualTo("Admin"));
        }
    }
}
