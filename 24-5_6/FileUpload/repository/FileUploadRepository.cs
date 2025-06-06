using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FileUpload.Models;
using System.Linq;
using FileUpload.Contexts;

namespace FileUpload.Repository
{
    public interface IFileUploadRepository
    {
        Task<FileDocument> UploadFileAsync(FileDocument file);
        Task<FileDocument?> GetFileByIdAsync(Guid id);
        Task<IEnumerable<FileDocument>> GetAllFilesAsync();
        Task<IEnumerable<FileDocument>> GetFilesByTypeAsync(string fileType);
        Task<bool> DeleteFileAsync(Guid id);
        Task<FileDocument?> UpdateFileMetadataAsync(Guid id, string? metadata);
    }

    public class FileUploadRepository : IFileUploadRepository
    {
        private readonly FileUploadContext _context;

        public FileUploadRepository(FileUploadContext context)
        {
            _context = context;
        }

        public async Task<FileDocument> UploadFileAsync(FileDocument file)
        {
            if (file == null)
                throw new ArgumentNullException(nameof(file));

            await _context.Files.AddAsync(file);
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<FileDocument?> GetFileByIdAsync(Guid id)
        {
            return await _context.Files
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<IEnumerable<FileDocument>> GetAllFilesAsync()
        {
            return await _context.Files
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<FileDocument>> GetFilesByTypeAsync(string fileType)
        {
            return await _context.Files
                .Where(f => f.FileType.ToLower() == fileType.ToLower())
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();
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

        public async Task<FileDocument?> UpdateFileMetadataAsync(Guid id, string? metadata)
        {
            var file = await _context.Files.FindAsync(id);
            if (file == null)
                return null;

            file.Metadata = metadata;
            await _context.SaveChangesAsync();
            return file;
        }
    }
}
