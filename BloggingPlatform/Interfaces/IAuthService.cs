
using BloggingPlatform.Dto.User;
using BloggingPlatform.Models.DTOs;

namespace BloggingPlatform.Interfaces
{
    public interface IAuthenticationService
    {
        public Task<UserLoginResponse> Login(UserLoginRequest user);
    }
}