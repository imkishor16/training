using System;

namespace BloggingPlatform.Dto.RefreshToken;

public class RefreshTokenResponseDto
{
    public string Token { get; set; }
    public DateTime ExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; }
} 