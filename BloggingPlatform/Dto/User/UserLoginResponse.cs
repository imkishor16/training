namespace BloggingPlatform.Dto.User
{
    public class UserLoginResponse
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string RefreshToken{ get; set; }
    }
}
