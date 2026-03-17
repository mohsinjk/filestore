namespace FileStorage.Application.DTOs;

public sealed class FileListRequest
{
    public string? CaseId { get; init; }
    public string? CustomerId { get; init; }
    public string? Category { get; init; }
    public bool IncludeArchived { get; init; } = false;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
