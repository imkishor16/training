using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Interfaces;
using Microsoft.AspNetCore.Http;    
using Models.DTO;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideosController : ControllerBase
    {
        private readonly IVideoService _videoService;
        public VideosController(IVideoService videoService)
        {
            _videoService = videoService;
        }
        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] VideoUploadDto dto)
        {
            if (dto.VideoFile == null || dto.VideoFile.Length == 0)   
                return BadRequest("No file uploaded.");
            var video = await _videoService.UploadVideoAsync(dto.Title, dto.Description, dto.VideoFile);
            return Ok(video);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var videos = await _videoService.GetAllVideosAsync();
            return Ok(videos);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var video = await _videoService.GetVideoByIdAsync(id);
            if (video == null) return NotFound();
            return Ok(video);
        }
    }
} 