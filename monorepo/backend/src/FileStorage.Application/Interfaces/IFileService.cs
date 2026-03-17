using FileStorage.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace FileStorage.Application.Interfaces;

public interface IFileService
{
    Task<FileMetadataDto> UploadFileAsync(
        IFormFile file,
        string caseId,
        string customerId,
        string category,
        CancellationToken cancellationToken = default);

    Task<FileMetadataDto?> GetMetadataAsync(Guid id, CancellationToken cancellationToken = default);

    Task<(Stream Content, string ContentType, string FileName)?> DownloadFileAsync(
        Guid id, CancellationToken cancellationToken = default);

    Task<FileListResponse> ListFilesAsync(
        FileListRequest request, CancellationToken cancellationToken = default);

    Task<FileMetadataDto?> UpdateStatusAsync(
        Guid id, string newStatus, CancellationToken cancellationToken = default);
}
