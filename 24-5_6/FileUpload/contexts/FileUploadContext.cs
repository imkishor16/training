using Microsoft.EntityFrameworkCore;
using FileUpload.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;


namespace FileUpload.Contexts
{
    public class FileUploadContext : DbContext
    {
        public FileUploadContext(DbContextOptions<FileUploadContext> options) : base(options)
        {
        }

        public DbSet<FileDocument> Files { get; set; }

        
        public async Task<List<FileDocument>> GetFilesByType(string fileType)
        {
            return await Files
                .Where(f => f.FileType.ToLower() == fileType.ToLower())
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();
        }
        
        public async Task<List<FileDocument>> GetRecentFiles(int count = 10)
        {
            return await Files
                .OrderByDescending(f => f.UploadDate)
                .Take(count)
                .ToListAsync();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<FileDocument>(entity =>
            {
                // Primary key configuration
                entity.HasKey(e => e.Id)
                      .HasName("PK_FileDocument");

                // Required fields
                entity.Property(e => e.FileName)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.Property(e => e.FileType)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.ContentType)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.FileSize)
                      .IsRequired();

                entity.Property(e => e.UploadDate)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                // Optional fields
                entity.Property(e => e.Metadata)
                      .HasMaxLength(4000);

                // Index for faster querying
                entity.HasIndex(e => e.FileType)
                      .HasDatabaseName("IX_FileDocument_FileType");

                entity.HasIndex(e => e.UploadDate)
                      .HasDatabaseName("IX_FileDocument_UploadDate");
            });
        }
    }
}
