using FileUpload.Interfaces;
using FileUpload.Models;
using FileUpload.Contexts;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace FileUpload.Services
{
    public class FileService : IFileService
    {
        private readonly FileUploadContext _context;

        public FileService(FileUploadContext context)
        {
            _context = context;
        }

        public async Task<FileDocument> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null", nameof(file));

            var fileDocument = new FileDocument
            {
                FileName = file.FileName,
                FileType = Path.GetExtension(file.FileName),
                ContentType = file.ContentType,
                FileSize = file.Length,
                UploadDate = DateTime.UtcNow
            };

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                fileDocument.FileData = ms.ToArray();
            }

            await _context.Files.AddAsync(fileDocument);
            await _context.SaveChangesAsync();

            return fileDocument;
        }

        public async Task<FileDocument?> GetFileByIdAsync(Guid id)
        {
            return await _context.Files.FindAsync(id);
        }

        public async Task<IEnumerable<FileDocument>> GetAllFilesAsync()
        {
            return await _context.Files
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<FileDocument>> GetFilesByTypeAsync(string fileType)
        {
            return await _context.GetFilesByType(fileType);
        }

        public async Task<IEnumerable<FileDocument>> GetRecentFilesAsync(int count = 10)
        {
            return await _context.GetRecentFiles(count);
        }

        public async Task<bool> DeleteFileAsync(Guid id)
        {
            var file = await _context.Files.FindAsync(id);
            if (file == null)
                return false;

            _context.Files.Remove(file);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<FileDocument?> UpdateFileMetadataAsync(Guid id, string metadata)
        {
            var file = await _context.Files.FindAsync(id);
            if (file == null)
                return null;

            file.Metadata = metadata;
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<byte[]?> DownloadFileAsync(Guid id)
        {
            var file = await _context.Files.FindAsync(id);
            return file?.FileData;
        }
    }
} 