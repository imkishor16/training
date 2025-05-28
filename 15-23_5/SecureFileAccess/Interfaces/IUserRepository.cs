using SecureFileAccess.Models;

namespace SecureFileAccess.Interfaces
{
    public interface IUserRepository
    {
        User GetUserByUsername(string username);
    }
}
