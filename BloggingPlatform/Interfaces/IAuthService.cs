using System.Threading.Tasks;
using BloggingPlatform.Dto.User;
using BloggingPlatform.Models;

namespace BloggingPlatform.Interfaces
{
    public interface IAuthService
    {
        Task<UserLoginResponse> LoginAsync(string email, string password);
        Task<UserLoginResponse> RegisterAsync(User user);
        Task<UserLoginResponse> RefreshTokenAsync(string accessToken, string refreshToken);
        Task<bool> RevokeTokenAsync(string refreshToken);
    }
} 