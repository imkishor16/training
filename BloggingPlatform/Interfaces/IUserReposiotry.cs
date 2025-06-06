using BloggingPlatform.Models;
using System.Threading.Tasks;

namespace BloggingPlatform.Interfaces{


public interface IUserRepository
{
    Task<User> RegisterAsync(User user, string password);
    Task<User?> AuthenticateAsync(string email, string password);
    Task<User?> GetByEmailAsync(string email);
}

}