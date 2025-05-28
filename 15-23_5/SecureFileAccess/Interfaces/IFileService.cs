namespace SecureFileAccess.Interfaces
{
    public interface IFileService
    {
        void AccessFile(string fileName, string username);
    }
}
