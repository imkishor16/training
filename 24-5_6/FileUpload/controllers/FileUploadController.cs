using Microsoft.AspNetCore.Mvc;
using FileUpload.Interfaces;
using FileUpload.Models;
using System.Net.Mime;

namespace FileUpload.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(IFileService fileService, ILogger<FileUploadController> logger)
        {
            _fileService = fileService;
            _logger = logger;
        }

        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file was uploaded.");

                var result = await _fileService.UploadFileAsync(file);
                return CreatedAtAction(nameof(GetFile), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, "Internal server error while uploading file");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FileDocument>> GetFile(Guid id)
        {
            var file = await _fileService.GetFileByIdAsync(id);
            if (file == null)
                return NotFound();

            return Ok(file);
        }

        [HttpGet("download/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DownloadFile(Guid id)
        {
            var file = await _fileService.GetFileByIdAsync(id);
            if (file == null)
                return NotFound();

            var fileData = await _fileService.DownloadFileAsync(id);
            if (fileData == null)
                return NotFound();

            return File(fileData, file.ContentType, file.FileName);
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FileDocument>>> GetAllFiles()
        {
            var files = await _fileService.GetAllFilesAsync();
            return Ok(files);
        }

        [HttpGet("type/{fileType}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FileDocument>>> GetFilesByType(string fileType)
        {
            var files = await _fileService.GetFilesByTypeAsync(fileType);
            return Ok(files);
        }

        [HttpGet("recent")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FileDocument>>> GetRecentFiles([FromQuery] int count = 10)
        {
            var files = await _fileService.GetRecentFilesAsync(count);
            return Ok(files);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteFile(Guid id)
        {
            var result = await _fileService.DeleteFileAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPut("{id}/metadata")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FileDocument>> UpdateFileMetadata(Guid id, [FromBody] string metadata)
        {
            var file = await _fileService.UpdateFileMetadataAsync(id, metadata);
            if (file == null)
                return NotFound();

            return Ok(file);
        }
    }
}
