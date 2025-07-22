using BloggingPlatform.Interfaces;
using BloggingPlatform.Models;
using BloggingPlatform.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using System.Security.Claims;
using BloggingPlatform.Dto.Report;


namespace BloggingPlatform.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/reports")]
    [ApiVersion("1.0")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IMapper _mapper;

        public ReportController(IReportService reportService, IMapper mapper)
        {
            _reportService = reportService;
            _mapper = mapper;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddReport([FromBody] CreateReportDto dto)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                if(await _reportService.IsUserReportedPostAlready(dto.PostId,dto.UserId))
                    return Conflict($"user already reported post");
                
                dto.UserId = currentUserId;
                var report = _mapper.Map<Report>(dto);
                var created = await _reportService.AddReport(report, dto.UserId);
                return CreatedAtAction(nameof(AddReport), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding report: {ex.Message}");
            }
        }

        [HttpGet("Isreport")]
        [Authorize]
        public async Task<IActionResult> IsReportExist(string postId)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!Guid.TryParse(idClaim, out Guid currentUserId))
                    return Unauthorized("Invalid user identity.");

                var PostId = Guid.Parse(postId);
                var UserId = currentUserId;
                if (await _reportService.IsUserReportedPostAlready(PostId,UserId))
                    return Ok(new ReportCheckResponseDto
                    {
                        Message = "reported",
                        IsExists = true
                    });
                return Ok(new ReportCheckResponseDto
                {
                    Message = "No report",
                    IsExists = false
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting report: {ex.Message}");
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Report>> GetReportById(Guid id)
        {
            try
            {
                var report = await _reportService.GetReportById(id);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("filter")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> GetFilteredReports(string postId,string? category)
        {
            try
            {
                var reports = await _reportService.GetReportByPostId(Guid.Parse(postId),category);
                if (reports.Count() == 0)
                {
                    return NotFound("no reports in the given category");
                }
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching comments: {ex.Message}");
            }
        }
    }
}
