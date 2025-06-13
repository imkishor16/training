using System.Threading.Tasks;

namespace BloggingPlatform.Interfaces
{
    public interface IUserValidationService
    {
        Task ValidateUserEmail(string email);
    }
}
