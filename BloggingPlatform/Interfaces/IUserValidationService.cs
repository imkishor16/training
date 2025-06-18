using System.Threading.Tasks;

namespace BloggingPlatform.Interfaces
{
    public interface IUserValidationService
    {
        Task ValidateUser(Guid userId);
    }
}
