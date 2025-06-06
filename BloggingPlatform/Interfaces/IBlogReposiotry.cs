using BloggingPlatform.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BloggingPlatform.Interfaces
{
public interface IBlogRepository
{
    Task<BlogPost> CreatePostAsync(BlogPost post);
    Task<BlogPost?> GetPostByIdAsync(int id);
    Task<IEnumerable<BlogPost>> GetAllPostsAsync();
    Task<Comment> AddCommentAsync(Comment comment);
    Task<bool> DeletePostAsync(int postId);
}
}