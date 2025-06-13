using Microsoft.EntityFrameworkCore;
using BloggingPlatform.Models;

namespace BloggingPlatform.Contexts;

public class BloggingPlatformContext : DbContext
{
    public BloggingPlatformContext(DbContextOptions<BloggingPlatformContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Image> Images { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<ModerationLog> ModerationLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
            
            entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Password).HasMaxLength(255).IsRequired();
            entity.Property(u => u.FirstName).HasMaxLength(50);
            entity.Property(u => u.LastName).HasMaxLength(50);
            entity.Property(u => u.Bio).HasMaxLength(1000);

            // Configure default values
            entity.Property(u => u.Status).HasDefaultValue(UserStatus.Active);
            entity.Property(u => u.IsDeleted).HasDefaultValue(false);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Post configurations
        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Content).IsRequired();

            // Configure default values
            entity.Property(p => p.Status).HasDefaultValue(PostStatus.Draft);
            entity.Property(p => p.ModerationStatus).HasDefaultValue(ModerationStatus.Pending);
            entity.Property(p => p.IsDeleted).HasDefaultValue(false);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Comment configurations
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(c => c.Content).HasMaxLength(2000).IsRequired();

            // Configure default values
            entity.Property(c => c.IsDeleted).HasDefaultValue(false);
            entity.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Image configurations
        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasOne(i => i.Post)
                .WithMany(p => p.Images)
                .HasForeignKey(i => i.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(i => i.FileName).IsRequired();
            entity.Property(i => i.Data).IsRequired();
            entity.Property(i => i.Description).HasMaxLength(500);

            // Configure default values
            entity.Property(i => i.IsDeleted).HasDefaultValue(false);
            entity.Property(i => i.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // RefreshToken configurations
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(rt => rt.Token).HasMaxLength(500).IsRequired();

            // Configure default values
            entity.Property(rt => rt.IsRevoked).HasDefaultValue(false);
            entity.Property(rt => rt.IsUsed).HasDefaultValue(false);
            entity.Property(rt => rt.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // ModerationLog configurations
        modelBuilder.Entity<ModerationLog>(entity =>
        {
            entity.HasOne(ml => ml.Moderator)
                .WithMany(u => u.ModerationLogs)
                .HasForeignKey(ml => ml.ModeratorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(ml => ml.TargetId).HasMaxLength(100).IsRequired();
            entity.Property(ml => ml.Reason).HasMaxLength(200);
            entity.Property(ml => ml.Notes).HasMaxLength(1000);

            // Configure default values
            entity.Property(ml => ml.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
} 