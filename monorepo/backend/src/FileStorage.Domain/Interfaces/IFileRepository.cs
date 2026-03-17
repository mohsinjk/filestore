using FileStorage.Domain.Entities;
using FileStorage.Domain.Enums;

namespace FileStorage.Domain.Interfaces;

public interface IFileRepository
{
    Task CreateAsync(FileRecord fileRecord, CancellationToken cancellationToken = default);
    Task<FileRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateAsync(FileRecord fileRecord, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<FileRecord> Items, int TotalCount)> ListAsync(
        string? caseId,
        string? customerId,
        FileCategory? category,
        bool includeArchived,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
