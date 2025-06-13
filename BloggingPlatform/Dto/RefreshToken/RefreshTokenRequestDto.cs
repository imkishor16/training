using System.ComponentModel.DataAnnotations;

namespace BloggingPlatform.Dto.RefreshToken;
 
public class RefreshTokenRequestDto
{
    [Required]
    public string Token { get; set; }
} 