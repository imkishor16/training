using Microsoft.AspNetCore.Http;

public class RegisterUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Reader"; // Default role
}

public class LoginUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class CreatePostDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
}

public class CommentDto
{
    public int PostId { get; set; }
    public string Content { get; set; } = string.Empty;
}
