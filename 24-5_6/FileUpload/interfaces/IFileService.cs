using FileUpload.Models;
using Microsoft.AspNetCore.Http;

namespace FileUpload.Interfaces
{
    public interface IFileService
    {
        Task<FileDocument> UploadFileAsync(IFormFile file);
        Task<FileDocument?> GetFileByIdAsync(Guid id);
        Task<IEnumerable<FileDocument>> GetAllFilesAsync();
        Task<IEnumerable<FileDocument>> GetFilesByTypeAsync(string fileType);
        Task<IEnumerable<FileDocument>> GetRecentFilesAsync(int count = 10);
        Task<bool> DeleteFileAsync(Guid id);
        Task<FileDocument?> UpdateFileMetadataAsync(Guid id, string metadata);
        Task<byte[]?> DownloadFileAsync(Guid id);
    }
} 