using BloggingPlatform.Helpers;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;

namespace BloggingPlatform.Interfaces
{
    public interface IReportService
    {
        public Task<Report> AddReport(Report report, Guid userId);
        public Task<IEnumerable<Report>> GetReportByPostId(Guid postId,string? category);
        public Task<Report> GetReportById(Guid id);
        public Task<Boolean> IsUserReportedPostAlready(Guid postId, Guid userId);
    }
}
