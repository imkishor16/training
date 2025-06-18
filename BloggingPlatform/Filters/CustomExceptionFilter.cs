using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using BloggingPlatform.Models;
using System.Net;
using BloggingPlatform.Models.Misc;

namespace BloggingPlatform.Filters
{
    public class CustomExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<CustomExceptionFilter> _logger;

        public CustomExceptionFilter(ILogger<CustomExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            var exception = context.Exception;
            _logger.LogError(exception, "An unhandled exception occurred.");

            var errorResponse = new ErrorResponseDto
            {
                Title = "An error occurred while processing your request.",
                Detail = exception.Message+GetErrorCode(exception)
            };

            context.Result = new ObjectResult(errorResponse)
            {
                StatusCode = GetStatusCode(exception)
            };

            context.ExceptionHandled = true;
        }

        private string GetErrorCode(Exception exception)
        {
            return exception switch
            {
                ArgumentException => "INVALID_ARGUMENT",
                UnauthorizedAccessException => "UNAUTHORIZED",
                InvalidOperationException => "INVALID_OPERATION",
                _ => "INTERNAL_ERROR"
            };
        }

        private int GetStatusCode(Exception exception)
        {
            return exception switch
            {
                ArgumentException => (int)HttpStatusCode.BadRequest,
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };
        }
    }
} 