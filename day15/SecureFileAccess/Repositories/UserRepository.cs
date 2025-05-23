using SecureFileAccess.Models;
using SecureFileAccess.Interfaces;
using System.Collections.Generic;

namespace SecureFileAccess.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly Dictionary<string, User> users = new()
        {
            { "Alice", new User { Username = "Alice", Role = "Admin" } },
            { "Bob", new User { Username = "Bob", Role = "Guest" } },
            { "Charlie", new User { Username = "Charlie", Role = "User" } }
        };

        public User GetUserByUsername(string username)
        {
            return users.ContainsKey(username) ? users[username] : null;
        }
    }
}
