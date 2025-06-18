using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;

namespace BloggingPlatform.Validations
{
    public class UserValidationService : IUserValidationService
    {
        private readonly IRepository<Guid, User> _userRepository;

        public UserValidationService(IRepository<Guid, User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task ValidateUser(Guid userId)
        {
            var user = await _userRepository.Get(userId);
            if (user == null)
                throw new Exception("Invalid user email.");

            if (user.IsDeleted)
                throw new Exception("User is deleted.");
        }
    }
}
