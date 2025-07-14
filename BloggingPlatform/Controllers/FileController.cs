using BloggingPlatform.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BloggingPlatform.Dto.FileUpload;
using Microsoft.AspNetCore.Authorization;

namespace BloggingPlatform.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly FileStorageService _blobStorageService;

        public FilesController(FileStorageService blobStorageService)
        {
            _blobStorageService  = blobStorageService;
        }
        [HttpGet]
        public async Task<ActionResult<Stream>> Download(string fileName)
        {
            var stream = await _blobStorageService.DownloadFile(fileName);
            if (stream == null) 
                return NotFound();
            return File(stream, "application/octet-stream", fileName);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] FileUploadDto file)
        {
            if (file == null || file.File.Length == 0)
                return BadRequest("No file to upload");
            using var stream = file.File.OpenReadStream();
            await _blobStorageService.UploadFile(stream, file.File.FileName);
            return Ok("File uploaded");
        }
    }
}