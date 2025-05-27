using SecureFileAccess.Interfaces;
using SecureFileAccess.Models;
using SecureFileAccess.Proxy;
using SecureFileAccess.Exceptions;

namespace SecureFileAccess.Services
{
    public class FileService : IFileService
    {
        private readonly IUserRepository userRepository;

        public FileService(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public void AccessFile(string fileName, string username)
        {
            var user = userRepository.GetUserByUsername(username);
            if (user == null)
            {
                Console.WriteLine("[Error] User not found.");
                return;
            }

            try
            {
                IFile file = new ProxyFile(fileName, user);
                file.Read();
            }
            catch (AccessDeniedException ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}
