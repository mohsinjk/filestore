using FileStorage.Application.DTOs;
using FileStorage.Application.Interfaces;
using FileStorage.Domain.Entities;
using FileStorage.Domain.Enums;
using FileStorage.Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace FileStorage.Application.Services;

public sealed class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly long _maxFileSizeBytes;
    private readonly IReadOnlyList<string> _allowedMimeTypes;

    public FileService(
        IFileRepository fileRepository,
        IFileStorageService fileStorageService,
        IConfiguration configuration)
    {
        _fileRepository = fileRepository;
        _fileStorageService = fileStorageService;
        _maxFileSizeBytes = configuration.GetValue<long>("FileStorage:MaxFileSizeBytes", 52_428_800);
        _allowedMimeTypes = configuration
            .GetSection("FileStorage:AllowedMimeTypes")
            .Get<List<string>>() ?? [];
    }

    public async Task<FileMetadataDto> UploadFileAsync(
        IFormFile file,
        string caseId,
        string customerId,
        string category,
        CancellationToken cancellationToken = default)
    {
        var errors = new List<string>();

        if (file.Length > _maxFileSizeBytes)
            throw new ArgumentException(
                $"File size exceeds the maximum allowed limit of {_maxFileSizeBytes / 1_048_576} MB.");

        if (_allowedMimeTypes.Count > 0 && !_allowedMimeTypes.Contains(file.ContentType))
            throw new ArgumentException(
                $"File type '{file.ContentType}' is not permitted. Allowed types: {string.Join(", ", _allowedMimeTypes)}.");

        if (string.IsNullOrWhiteSpace(caseId)) errors.Add("caseId is required.");
        if (string.IsNullOrWhiteSpace(customerId)) errors.Add("customerId is required.");
        if (string.IsNullOrWhiteSpace(category)) errors.Add("category is required.");

        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        if (!Enum.TryParse<FileCategory>(category, ignoreCase: true, out var fileCategory))
            throw new ArgumentException(
                $"category must be one of: {string.Join(", ", Enum.GetNames<FileCategory>())}.");

        var fileId = Guid.NewGuid();
        var storagePath = $"{customerId}/{caseId}/{fileId}/{file.FileName}";

        using var stream = file.OpenReadStream();
        await _fileStorageService.UploadAsync(stream, storagePath, file.ContentType, cancellationToken);

        var fileRecord = FileRecord.Create(
            file.FileName,
            file.ContentType,
            file.Length,
            storagePath,
            caseId,
            customerId,
            fileCategory);

        // Override the Id so the storagePath and the Firestore document ID match
        var recordWithId = FileRecord.Create(
            fileId,
            file.FileName,
            file.ContentType,
            file.Length,
            storagePath,
            caseId,
            customerId,
            fileCategory,
            FileLifecycleStatus.Active,
            fileRecord.UploadedAt,
            fileRecord.StatusChangedAt);

        try
        {
            await _fileRepository.CreateAsync(recordWithId, cancellationToken);
        }
        catch
        {
            await _fileStorageService.DeleteAsync(storagePath, CancellationToken.None);
            throw;
        }

        return MapToDto(recordWithId);
    }

    public async Task<FileMetadataDto?> GetMetadataAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        var record = await _fileRepository.GetByIdAsync(id, cancellationToken);
        if (record is null || record.Status == FileLifecycleStatus.Deleted)
            return null;

        return MapToDto(record);
    }

    public async Task<(Stream Content, string ContentType, string FileName)?> DownloadFileAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        var record = await _fileRepository.GetByIdAsync(id, cancellationToken);
        if (record is null || record.Status == FileLifecycleStatus.Deleted)
            return null;

        var ms = new MemoryStream();
        await _fileStorageService.DownloadAsync(record.StoragePath, ms, cancellationToken);
        ms.Position = 0;

        return (ms, record.ContentType, record.FileName);
    }

    public async Task<FileListResponse> ListFilesAsync(
        FileListRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CaseId) && string.IsNullOrWhiteSpace(request.CustomerId))
            throw new ArgumentException("At least one of caseId or customerId must be provided.");

        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);

        FileCategory? category = null;
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            if (!Enum.TryParse<FileCategory>(request.Category, ignoreCase: true, out var parsed))
                throw new ArgumentException(
                    $"category must be one of: {string.Join(", ", Enum.GetNames<FileCategory>())}.");
            category = parsed;
        }

        var (items, totalCount) = await _fileRepository.ListAsync(
            request.CaseId,
            request.CustomerId,
            category,
            request.IncludeArchived,
            page,
            pageSize,
            cancellationToken);

        return new FileListResponse
        {
            Items = items.Select(MapToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<FileMetadataDto?> UpdateStatusAsync(
        Guid id, string newStatus, CancellationToken cancellationToken = default)
    {
        var record = await _fileRepository.GetByIdAsync(id, cancellationToken);
        if (record is null || record.Status == FileLifecycleStatus.Deleted)
            return null;

        if (!Enum.TryParse<FileLifecycleStatus>(newStatus, ignoreCase: true, out var targetStatus))
            throw new ArgumentException(
                $"status must be one of: {string.Join(", ", Enum.GetNames<FileLifecycleStatus>())}.");

        record.TransitionStatus(targetStatus);

        await _fileRepository.UpdateAsync(record, cancellationToken);
        return MapToDto(record);
    }

    private static FileMetadataDto MapToDto(FileRecord r) => new()
    {
        Id = r.Id,
        FileName = r.FileName,
        ContentType = r.ContentType,
        FileSizeBytes = r.FileSizeBytes,
        CaseId = r.CaseId,
        CustomerId = r.CustomerId,
        Category = r.Category.ToString(),
        Status = r.Status.ToString(),
        UploadedAt = r.UploadedAt,
        StatusChangedAt = r.StatusChangedAt
    };
}
