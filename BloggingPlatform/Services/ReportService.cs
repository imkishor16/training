using BloggingPlatform.Helpers;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Extensions;
using System.Text.Json;

namespace BloggingPlatform.Services
{
    public class ReportService : IReportService
    {
        private readonly IRepository<Guid, Report> _reportRepo;
        private readonly IUserValidationService _userValidationService;

        public ReportService(IRepository<Guid, Report> reportRepo, IUserValidationService userValidationService)
        {
            _reportRepo = reportRepo;
            _userValidationService = userValidationService;
        }

        public async Task<Report> AddReport(Report report, Guid userId)
        {
            await _userValidationService.ValidateUser(userId);
            var added = await _reportRepo.Add(report);
            return added;
        }
        public async Task<Report> GetReportById(Guid id)
        {
            var report = await _reportRepo.Get(id);

            if (report == null)
                throw new Exception("Report not found");

            return report;
        }

        public async Task<IEnumerable<Report>> GetReportByPostId(Guid postId,string? category)
        {
            var reports = await _reportRepo.GetAll();
            
            var query = reports.Where(r => r.PostId == postId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                if (Enum.TryParse<ReportCategory>(category, out var parsedCategory))
                {
                    query = query.Where(r => r.Category == parsedCategory);
                }
            }
            return query.ToList();
        }

        public async Task<Boolean> IsUserReportedPostAlready(Guid postId, Guid userId)
        {
            var reports = await _reportRepo.GetAll();
            var final = reports.Where(r => r.PostId == postId && r.UserId == userId);
            if (final.Any())
            {
                // Console.WriteLine($"Post id : {postId}");
                // Console.WriteLine($"User id : {userId}");
                return true;
            }
            return false;
        }
    }
}
