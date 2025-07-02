using BloggingPlatform.Models;

namespace BloggingPlatform.Dto.Post
{
    public class PostResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string PostStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        public BasicUserDto User { get; set; }
        
        public List<BasicCommentDto> Comments { get; set; }
        
        public int LikeCount { get; set; }
        public bool UserHasLiked { get; set; }
    }

    public class BasicUserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
    }

    public class BasicCommentDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public BasicUserDto User { get; set; }
    }
} 