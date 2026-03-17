using FileStorage.Domain.Entities;
using FileStorage.Domain.Enums;
using FileStorage.Domain.Interfaces;
using FileStorage.Infrastructure.Configuration;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Options;

namespace FileStorage.Infrastructure.Repositories;

public sealed class FirestoreFileRepository : IFileRepository
{
    private const string CollectionName = "file-records";

    private readonly FirestoreDb _db;

    public FirestoreFileRepository(IOptions<FirestoreOptions> options)
    {
        _db = FirestoreDb.Create(options.Value.ProjectId);
    }

    public async Task CreateAsync(FileRecord fileRecord, CancellationToken cancellationToken = default)
    {
        var doc = _db.Collection(CollectionName).Document(fileRecord.Id.ToString());
        await doc.SetAsync(ToDocument(fileRecord), cancellationToken: cancellationToken);
    }

    public async Task<FileRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var snapshot = await _db.Collection(CollectionName)
            .Document(id.ToString())
            .GetSnapshotAsync(cancellationToken);

        return snapshot.Exists ? FromSnapshot(snapshot) : null;
    }

    public async Task UpdateAsync(FileRecord fileRecord, CancellationToken cancellationToken = default)
    {
        var doc = _db.Collection(CollectionName).Document(fileRecord.Id.ToString());
        await doc.SetAsync(ToDocument(fileRecord), cancellationToken: cancellationToken);
    }

    public async Task<(IReadOnlyList<FileRecord> Items, int TotalCount)> ListAsync(
        string? caseId,
        string? customerId,
        FileCategory? category,
        bool includeArchived,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        Query query = _db.Collection(CollectionName);

        if (!string.IsNullOrEmpty(caseId))
            query = query.WhereEqualTo("caseId", caseId);

        if (!string.IsNullOrEmpty(customerId))
            query = query.WhereEqualTo("customerId", customerId);

        if (category.HasValue)
            query = query.WhereEqualTo("category", category.Value.ToString());

        // Always exclude Deleted
        query = query.WhereNotEqualTo("status", FileLifecycleStatus.Deleted.ToString());

        var allSnapshot = await query.GetSnapshotAsync(cancellationToken);

        // Filter Archived in-memory when not requested
        // (Firestore does not support OR-style status filters without an extra index)
        var filtered = includeArchived
            ? allSnapshot.Documents
            : allSnapshot.Documents.Where(d =>
                d.GetValue<string>("status") != FileLifecycleStatus.Archived.ToString()).ToList();

        var totalCount = filtered.Count();
        var items = filtered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(FromSnapshot)
            .ToList();

        return (items, totalCount);
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private static Dictionary<string, object> ToDocument(FileRecord r) => new()
    {
        ["id"] = r.Id.ToString(),
        ["fileName"] = r.FileName,
        ["contentType"] = r.ContentType,
        ["fileSizeBytes"] = r.FileSizeBytes,
        ["storagePath"] = r.StoragePath,
        ["caseId"] = r.CaseId,
        ["customerId"] = r.CustomerId,
        ["category"] = r.Category.ToString(),
        ["status"] = r.Status.ToString(),
        ["uploadedAt"] = Timestamp.FromDateTime(r.UploadedAt),
        ["statusChangedAt"] = Timestamp.FromDateTime(r.StatusChangedAt)
    };

    private static FileRecord FromSnapshot(DocumentSnapshot s)
    {
        return FileRecord.Create(
            id: Guid.Parse(s.GetValue<string>("id")),
            fileName: s.GetValue<string>("fileName"),
            contentType: s.GetValue<string>("contentType"),
            fileSizeBytes: s.GetValue<long>("fileSizeBytes"),
            storagePath: s.GetValue<string>("storagePath"),
            caseId: s.GetValue<string>("caseId"),
            customerId: s.GetValue<string>("customerId"),
            category: Enum.Parse<FileCategory>(s.GetValue<string>("category")),
            status: Enum.Parse<FileLifecycleStatus>(s.GetValue<string>("status")),
            uploadedAt: s.GetValue<Timestamp>("uploadedAt").ToDateTime(),
            statusChangedAt: s.GetValue<Timestamp>("statusChangedAt").ToDateTime()
        );
    }
}
