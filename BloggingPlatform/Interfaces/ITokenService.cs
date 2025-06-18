
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface ITokenService
    {
        public Task<string> GenerateToken(User user);
    }
}