namespace FileStorage.Application.DTOs;

public sealed class FileMetadataDto
{
    public Guid Id { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public string CaseId { get; init; } = string.Empty;
    public string CustomerId { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime UploadedAt { get; init; }
    public DateTime StatusChangedAt { get; init; }
}
