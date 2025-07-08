using BloggingPlatform.Models;
using BloggingPlatform.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BloggingPlatform.Repositories
{
    public class UserRepository : Repository<Guid, User>
    {
        public UserRepository(BloggingPlatformContext context) : base(context) { }

        public override async Task<User> Get(Guid userId)
        {
            return await _Context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
        }

        public override async Task<IEnumerable<User>> GetAll()
        {
            return await _Context.Users
                .Where(u => !u.IsDeleted)
                .ToListAsync();
        }

        public async Task<User> GetByEmail(string email)
        {
            return await _Context.Users
                .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        }
    }
}
