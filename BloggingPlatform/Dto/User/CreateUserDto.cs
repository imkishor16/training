using System.ComponentModel.DataAnnotations;

using BloggingPlatform.Models.DTOs;

namespace BloggingPlatform.Models.DTOs
{
    public class CreateUserDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        [Required]
        public string Username { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;

        public string Role { get; set; } = "User";
        public string? AdminSecret { get; set; }  


}

    
}