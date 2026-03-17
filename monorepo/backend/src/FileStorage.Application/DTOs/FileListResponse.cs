namespace FileStorage.Application.DTOs;

public sealed class FileListResponse
{
    public IReadOnlyList<FileMetadataDto> Items { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
}
