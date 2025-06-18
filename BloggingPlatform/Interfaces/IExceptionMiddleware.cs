namespace BloggingPlatform.Middleware
{
    public interface IExceptionMiddleware
    {
        Task Invoke(HttpContext context);
    }
}
