using Microsoft.EntityFrameworkCore;
using BloggingPlatform.Models;
using Microsoft.EntityFrameworkCore.Metadata;


namespace BloggingPlatform.Contexts
{
    public class BloggingPlatformContext : DbContext
    {
        public BloggingPlatformContext(DbContextOptions<BloggingPlatformContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserNotifications> UserNotifications { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // USER
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);


            modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

            modelBuilder.Entity<User>()
                .HasMany(u => u.Posts)      
                .WithOne(p => p.User)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany<Comment>(u => u.Comments)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasDefaultValue("User");

            modelBuilder.Entity<User>()
                .Property(u => u.IsSuspended)
                .HasDefaultValue(false);



            // POST
            modelBuilder.Entity<Post>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Post>()
                .Property(p => p.UserId)
                .IsRequired();

            modelBuilder.Entity<Post>()
                .HasMany(p => p.Images)
                .WithOne(i => i.Post)
                .HasForeignKey(i => i.PostId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Post>()
                .HasMany(p => p.Comments)
                .WithOne(c => c.Post)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Post>()
                .HasMany(p => p.Likes)
                .WithOne(l => l.Post)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // IMAGE
            modelBuilder.Entity<Image>()
                .HasKey(i => i.Id);

            modelBuilder.Entity<Image>()
                .Property(i => i.Content)
                .IsRequired();

            // COMMENT
            modelBuilder.Entity<Comment>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Comment>()
                .Property(c => c.UserId)
                .IsRequired();

            // LIKE
            modelBuilder.Entity<Like>()
                .HasKey(l => l.Id);

            modelBuilder.Entity<Like>()
                .Property(l => l.UserId)
                .IsRequired();

            modelBuilder.Entity<Like>()
                .Property(l => l.PostId)
                .IsRequired();

            modelBuilder.Entity<Like>()
                .Property(l => l.IsLiked)
                .IsRequired();

            //REFRESH TOKEN 
                modelBuilder.Entity<RefreshToken>()
                .HasIndex(r => r.Token)
                .IsUnique();

            // NOTIFICATION
            modelBuilder.Entity<Notification>()
                .HasKey(n => n.Id);

            modelBuilder.Entity<Notification>()
                .Property(n => n.EntityName)
                .IsRequired();

            modelBuilder.Entity<Notification>()
                .Property(n => n.EntityId)
                .IsRequired();

            modelBuilder.Entity<Notification>()
                .Property(n => n.Content)
                .IsRequired();

            // USER NOTIFICATIONS
            modelBuilder.Entity<UserNotifications>()
                .HasKey(un => un.Id);

            modelBuilder.Entity<UserNotifications>()
                .HasOne(un => un.User)
                .WithMany(u => u.UserNotifications)
                .HasForeignKey(un => un.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserNotifications>()
                .HasOne(un => un.Notification)
                .WithMany(n => n.NotificationUsers)
                .HasForeignKey(un => un.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
