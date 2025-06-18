
using BloggingPlatform.Models.Misc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BloggingPlatform.Middleware
{
    public class ExceptionMiddleware : IExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                context.Response.OnStarting(() =>
                {
                    if (context.Response.StatusCode == StatusCodes.Status401Unauthorized)
                    {
                        return context.Response.WriteAsJsonAsync(new
                        {
                            status = 401,
                            title = "Unauthorized",
                            detail = "Authentication is required."
                        });
                    }

                    if (context.Response.StatusCode == StatusCodes.Status403Forbidden)
                    {
                        return context.Response.WriteAsJsonAsync(new
                        {
                            status = 403,
                            title = "Forbidden",
                            detail = "You do not have permission to perform this action."
                        });
                    }

                    if (context.Response.StatusCode == StatusCodes.Status400BadRequest &&
                        context.Items.ContainsKey("ModelStateErrors"))
                    {
                        return context.Response.WriteAsJsonAsync(new
                        {
                            status = 400,
                            title = "Bad Request",
                            errors = context.Items["ModelStateErrors"]
                        });
                    }

                    return Task.CompletedTask;
                });

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred.");

                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";

                var error = _env.IsDevelopment()
                    ? new ErrorResponseDto { Status = 500, Title = "Server Error", Detail = ex.Message, StackTrace = ex.StackTrace }
                    : new ErrorResponseDto { Status = 500, Title = "Server Error", Detail = "An unexpected error occurred." };

                await context.Response.WriteAsJsonAsync(error);
            }
        }
    }
}
