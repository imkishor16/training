using BloggingPlatform.Models.DTOs;
using BloggingPlatform.Models;
using System.Collections.Generic;

namespace BloggingPlatform.Interfaces
{
    public interface IUserService
    {
        public Task<User> AddUser(User user);
        public Task<User> Get(Guid userId);
        public Task<User> GetByEmail(string email);

        public Task<IEnumerable<User>> GetAll();

        public Task<User> UpdateUser(Guid userId,User user);

        public Task<User> DeleteUser(Guid userId);
        public Task<IEnumerable<Post>> GetPostByUser(Guid userId);
       public  Task<IEnumerable<User>> GetAllFiltereduser(string? role, string? status, string? sortOrder, int? pageNumber, int? pageSize);



    }
}