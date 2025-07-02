using BloggingPlatform.Contexts;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Repositories;
using BloggingPlatform.Dto.User;
using Microsoft.OpenApi.Extensions;
using AutoMapper;

namespace BloggingPlatform.Services
{
    public class UserService : IUserService
    {
        private readonly BloggingPlatformContext _context;
        private readonly IRepository<Guid, User> _userrepository;
        private readonly IRepository<Guid, Post> _postrepository;
        private readonly IUserValidationService _userValidationService;
        private readonly IMapper _mapper;
        public UserService(BloggingPlatformContext context, IRepository<Guid, User> userrepository, IRepository<Guid, Post> postrepository,IUserValidationService userValidationService,IMapper mapper)
        {
            _context = context;
            _userrepository = userrepository;
            _postrepository = postrepository;
            _userValidationService = userValidationService;
            _mapper = mapper;
        }
        public async Task<User> AddUser(User user)
        {
            var createdUser = await _userrepository.Add(user);
            return createdUser;
        }
        public async Task<User> Get(Guid userId)
        {
            var user = await _userrepository.Get(userId);
            if (user == null)
                throw new Exception("User not found");
            return user;
        }
        public async Task<User> GetByEmail(string email)
        {
           return await ((UserRepository)_userrepository).GetByEmail(email);
        }
        public async Task<IEnumerable<User>> GetAll()
        {
            return await _userrepository.GetAll();
        }
        public async Task<User> UpdateUser(Guid userId,User user)
        {
            var existingUser = await _userrepository.Get(userId);
            var _user = await _userrepository.Update(userId, user);
            return user;
        }
        public async Task<User> DeleteUser(Guid userId)
        {
            User user = await _userrepository.Get(userId);

            if (user == null)
                throw new Exception("User not found");

            if (user.IsDeleted)
                return user;

            user.IsDeleted = true;
            await _userrepository.Update(userId, user);

            return user;
        }

        public async Task<IEnumerable<Post>> GetPostByUser(Guid userId)
        {
   
            var posts = await _postrepository.GetAll();
            var final = posts.Where(p => p.UserId == userId).ToList();
            return final;

        }
        public async Task<IEnumerable<User>> GetAllFiltereduser(string? role, string? status, string? sortOrder, int? pageNumber, int? pageSize)
        {
            var query = await _userrepository.GetAll();

            // Filter
            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role.ToLower() == role.ToLower());

            if (!string.IsNullOrEmpty(status))
                query = query.Where(u => u.Status.ToLower() == status.ToLower());

            // Sort
            if (sortOrder?.ToLower() == "desc")
                query = query.OrderByDescending(u => u.CreatedAt);
            else
                query = query.OrderBy(u => u.CreatedAt);

            // Pagination
            if (pageNumber.HasValue && pageSize.HasValue && pageNumber > 0 && pageSize > 0)
                query = query.Skip((pageNumber.Value - 1) * pageSize.Value).Take(pageSize.Value);

            return query.ToList();
        }
            



    }
    
}