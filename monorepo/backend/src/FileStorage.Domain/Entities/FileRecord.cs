using FileStorage.Domain.Enums;

namespace FileStorage.Domain.Entities;

public sealed class FileRecord
{
    public Guid Id { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public long FileSizeBytes { get; private set; }
    public string StoragePath { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string CustomerId { get; private set; } = string.Empty;
    public FileCategory Category { get; private set; }
    public FileLifecycleStatus Status { get; private set; }
    public DateTime UploadedAt { get; private set; }
    public DateTime StatusChangedAt { get; private set; }

    private FileRecord() { }

    public static FileRecord Create(
        string fileName,
        string contentType,
        long fileSizeBytes,
        string storagePath,
        string caseId,
        string customerId,
        FileCategory category)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("fileName is required.", nameof(fileName));
        if (string.IsNullOrWhiteSpace(contentType))
            throw new ArgumentException("contentType is required.", nameof(contentType));
        if (string.IsNullOrWhiteSpace(storagePath))
            throw new ArgumentException("storagePath is required.", nameof(storagePath));
        if (string.IsNullOrWhiteSpace(caseId))
            throw new ArgumentException("caseId is required.", nameof(caseId));
        if (string.IsNullOrWhiteSpace(customerId))
            throw new ArgumentException("customerId is required.", nameof(customerId));

        var now = DateTime.UtcNow;
        return new FileRecord
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            ContentType = contentType,
            FileSizeBytes = fileSizeBytes,
            StoragePath = storagePath,
            CaseId = caseId,
            CustomerId = customerId,
            Category = category,
            Status = FileLifecycleStatus.Active,
            UploadedAt = now,
            StatusChangedAt = now
        };
    }

    public static FileRecord Create(
        Guid id,
        string fileName,
        string contentType,
        long fileSizeBytes,
        string storagePath,
        string caseId,
        string customerId,
        FileCategory category,
        FileLifecycleStatus status,
        DateTime uploadedAt,
        DateTime statusChangedAt)
    {
        return new FileRecord
        {
            Id = id,
            FileName = fileName,
            ContentType = contentType,
            FileSizeBytes = fileSizeBytes,
            StoragePath = storagePath,
            CaseId = caseId,
            CustomerId = customerId,
            Category = category,
            Status = status,
            UploadedAt = uploadedAt,
            StatusChangedAt = statusChangedAt
        };
    }

    public void TransitionStatus(FileLifecycleStatus newStatus)
    {
        var allowed = (Status, newStatus) switch
        {
            (FileLifecycleStatus.Active, FileLifecycleStatus.Archived) => true,
            (FileLifecycleStatus.Active, FileLifecycleStatus.Deleted) => true,
            (FileLifecycleStatus.Archived, FileLifecycleStatus.Deleted) => true,
            _ => false
        };

        if (!allowed)
            throw new InvalidOperationException(
                $"Transition from '{Status}' to '{newStatus}' is not permitted.");

        Status = newStatus;
        StatusChangedAt = DateTime.UtcNow;
    }
}
