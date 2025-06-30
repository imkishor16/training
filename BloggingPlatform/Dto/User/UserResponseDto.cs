using System;
using BloggingPlatform.Models;

namespace BloggingPlatform.Dto.User;

public class UserResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; }= null!;
    public string Username { get; set; }= null!;

    public String Role { get; set; } = null!; 
    
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}