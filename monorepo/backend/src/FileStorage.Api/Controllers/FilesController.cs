using FileStorage.Application.DTOs;
using FileStorage.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FileStorage.Api.Controllers;

/// <summary>
/// Manages file storage for the Financing Department.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class FilesController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IFileService fileService, ILogger<FilesController> logger)
    {
        _fileService = fileService;
        _logger = logger;
    }

    /// <summary>
    /// Uploads a file and associates it with a Case and Customer.
    /// </summary>
    /// <param name="file">The file payload. Maximum 50 MB.</param>
    /// <param name="caseId">Identifier of the related Case.</param>
    /// <param name="customerId">Identifier of the related Customer.</param>
    /// <param name="category">One of: Invoice, Contract, Statement, Receipt, Agreement.</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The stored file's metadata.</returns>
    /// <response code="201">File uploaded successfully.</response>
    /// <response code="400">Validation failure — missing fields, unsupported type, or size exceeded.</response>
    /// <response code="500">Unexpected server error.</response>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(FileMetadataDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UploadFile(
        IFormFile file,
        [FromForm] string caseId,
        [FromForm] string customerId,
        [FromForm] string category,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await _fileService.UploadFileAsync(file, caseId, customerId, category, cancellationToken);
            return CreatedAtAction(nameof(GetMetadata), new { id = dto.Id }, dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error uploading file.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new ErrorResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Returns the metadata for a file by its ID.
    /// </summary>
    /// <param name="id">The file's unique identifier.</param>
    /// <param name="cancellationToken"></param>
    /// <response code="200">File metadata returned.</response>
    /// <response code="404">File not found or has been deleted.</response>
    [HttpGet("{id:guid}/metadata")]
    [ProducesResponseType(typeof(FileMetadataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMetadata(Guid id, CancellationToken cancellationToken)
    {
        var dto = await _fileService.GetMetadataAsync(id, cancellationToken);
        if (dto is null)
            return NotFound(new ErrorResponse($"File '{id}' not found."));

        return Ok(dto);
    }

    /// <summary>
    /// Downloads the binary content of a file.
    /// </summary>
    /// <param name="id">The file's unique identifier.</param>
    /// <param name="cancellationToken"></param>
    /// <response code="200">Binary file content returned.</response>
    /// <response code="404">File not found or has been deleted.</response>
    [HttpGet("{id:guid}/content")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadFile(Guid id, CancellationToken cancellationToken)
    {
        var result = await _fileService.DownloadFileAsync(id, cancellationToken);
        if (result is null)
            return NotFound(new ErrorResponse($"File '{id}' not found."));

        var (content, contentType, fileName) = result.Value;
        Response.Headers.ContentDisposition = $"attachment; filename=\"{fileName}\"";
        return File(content, contentType, fileName);
    }

    /// <summary>
    /// Lists files filtered by Case ID and/or Customer ID with optional pagination.
    /// </summary>
    /// <param name="request">Query parameters: caseId, customerId, category, includeArchived, page, pageSize.</param>
    /// <param name="cancellationToken"></param>
    /// <response code="200">Paginated list of file metadata.</response>
    /// <response code="400">Neither caseId nor customerId was provided.</response>
    [HttpGet]
    [ProducesResponseType(typeof(FileListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ListFiles(
        [FromQuery] FileListRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _fileService.ListFilesAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error listing files.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new ErrorResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Updates the lifecycle status of a file (Active → Archived, Active → Deleted, Archived → Deleted).
    /// </summary>
    /// <param name="id">The file's unique identifier.</param>
    /// <param name="request">The target status.</param>
    /// <param name="cancellationToken"></param>
    /// <response code="200">Status updated successfully.</response>
    /// <response code="400">Unrecognised status value.</response>
    /// <response code="404">File not found or already deleted.</response>
    /// <response code="409">Transition not permitted by the lifecycle state machine.</response>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(FileMetadataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateFileStatusRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await _fileService.UpdateStatusAsync(id, request.Status, cancellationToken);
            if (dto is null)
                return NotFound(new ErrorResponse($"File '{id}' not found."));

            return Ok(dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating file status.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new ErrorResponse("An unexpected error occurred."));
        }
    }

    private sealed record ErrorResponse(string Error, string[]? Details = null);
}
