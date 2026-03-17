# Data Model: File Storage Endpoint

**Feature**: 001-file-storage-endpoint  
**Date**: 2026-03-17  
**Layer**: Domain (`FileStorage.Domain`)

---

## Entities

### FileRecord

The core aggregate root. Represents a single stored file and all its associated metadata. Enforces domain invariants through a factory method and business-logic methods — no public setters.

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `Guid` | Unique, immutable identifier assigned at creation. Used as the Firestore document ID and GCS object key prefix. |
| `FileName` | `string` | Original file name as provided by the uploader (e.g., `invoice-2026-03.pdf`). |
| `ContentType` | `string` | MIME type declared by the uploader (e.g., `application/pdf`). |
| `FileSizeBytes` | `long` | Size of the binary payload in bytes. Set at upload time. |
| `StoragePath` | `string` | GCS object path where the binary is stored. Format: `{customerId}/{caseId}/{fileId}/{fileName}`. Immutable after creation. |
| `CaseId` | `string` | Non-empty reference identifier linking this file to an external Case. Not validated against any external system in this phase. |
| `CustomerId` | `string` | Non-empty reference identifier linking this file to an external Customer. Not validated against any external system in this phase. |
| `Category` | `FileCategory` | Classification of the file. One of the predefined `FileCategory` enum values. |
| `Status` | `FileLifecycleStatus` | Current lifecycle state. Defaults to `Active` on creation. |
| `UploadedAt` | `DateTime` | UTC timestamp recorded at the moment of successful upload. Immutable after creation. |
| `StatusChangedAt` | `DateTime` | UTC timestamp of the most recent lifecycle status transition. Updated by `TransitionStatus(...)`. Equals `UploadedAt` on initial creation. |

**Factory method**: `FileRecord.Create(fileName, contentType, fileSizeBytes, storagePath, caseId, customerId, category)`  
- Validates all string fields are non-null/non-empty.  
- Sets `Id = Guid.NewGuid()`.  
- Sets `Status = FileLifecycleStatus.Active`.  
- Sets `UploadedAt = StatusChangedAt = DateTime.UtcNow`.  
- Throws `ArgumentException` for any violated invariant.

**Business method**: `TransitionStatus(FileLifecycleStatus newStatus)`  
- Enforces allowed transitions (see state machine below).  
- Throws `InvalidOperationException` with a descriptive message if the transition is not permitted.  
- On success: sets `Status = newStatus` and `StatusChangedAt = DateTime.UtcNow`.

---

## Enums

### FileLifecycleStatus

Represents the three lifecycle states of a stored file.

| Value | Ordinal | Description |
|-------|---------|-------------|
| `Active` | 0 | File is in normal use. Appears in standard list and download operations. |
| `Archived` | 1 | File is retained for record-keeping but no longer actively in use. Appears in list queries only if explicitly requested. Excluded from standard listings. |
| `Deleted` | 2 | File has been soft-deleted. Never returned in list or download operations. Binary may be retained in GCS for a configurable retention period. |

### FileCategory

Fixed predefined classification values for files in the Financing domain.

| Value | Ordinal | Description |
|-------|---------|-------------|
| `Invoice` | 0 | Billing or invoice document. |
| `Contract` | 1 | Legal contract or agreement document. |
| `Statement` | 2 | Financial or account statement. |
| `Receipt` | 3 | Payment receipt. |
| `Agreement` | 4 | Formal agreement (non-contract, e.g., service agreement). |

---

## State Machine: FileLifecycleStatus

```
            ┌─────────────────────────────────┐
  [create]  │                                 │
    ─────►  Active ──────► Archived ──────► Deleted
              │                                ▲
              └────────────────────────────────┘
```

| From | To | Allowed | Notes |
|------|----|---------|-------|
| `Active` | `Archived` | ✅ Yes | Standard archiving |
| `Active` | `Deleted` | ✅ Yes | Direct soft delete |
| `Archived` | `Deleted` | ✅ Yes | Archived file clean-up |
| `Archived` | `Active` | ❌ No | Re-activation not supported in phase 1 |
| `Deleted` | `Active` | ❌ No | Restoring deleted files not supported in phase 1 |
| `Deleted` | `Archived` | ❌ No | Invalid — Deleted is terminal |

---

## Firestore Mapping

Collection: `file-records`  
Document ID: `{FileRecord.Id}` (Guid as string)

```json
{
  "id":              "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fileName":        "invoice-2026-03.pdf",
  "contentType":     "application/pdf",
  "fileSizeBytes":   204800,
  "storagePath":     "CUST-001/CASE-101/3fa85f64-.../invoice-2026-03.pdf",
  "caseId":          "CASE-101",
  "customerId":      "CUST-001",
  "category":        "Invoice",
  "status":          "Active",
  "uploadedAt":      "2026-03-17T10:00:00Z",
  "statusChangedAt": "2026-03-17T10:00:00Z"
}
```

**Indexes required** (to support list queries):
- Composite index: `caseId ASC` + `uploadedAt DESC`  
- Composite index: `customerId ASC` + `uploadedAt DESC`  
- Composite index: `caseId ASC` + `category ASC` + `uploadedAt DESC`  
- Composite index: `customerId ASC` + `category ASC` + `uploadedAt DESC`  
- Composite index: `caseId ASC` + `customerId ASC` + `uploadedAt DESC`  
- Composite index: `caseId ASC` + `customerId ASC` + `category ASC` + `uploadedAt DESC`

*Note: Firestore auto-creates single-field indexes. Composite indexes must be deployed via `firestore.indexes.json` or the Google Cloud Console.*

---

## Interfaces (Domain Contracts)

### IFileRepository

Defined in `FileStorage.Domain/Interfaces/IFileRepository.cs`. Implemented by `FirestoreFileRepository` in Infrastructure.

```csharp
Task<FileRecord> CreateAsync(FileRecord fileRecord);
Task<FileRecord?> GetByIdAsync(Guid id);
Task<FileRecord> UpdateAsync(FileRecord fileRecord);
Task<(IReadOnlyList<FileRecord> Items, int TotalCount)> ListAsync(
    string? caseId,
    string? customerId,
    FileCategory? category,
    int page,
    int pageSize);
```

### IFileStorageService

Defined in `FileStorage.Domain/Interfaces/IFileStorageService.cs`. Implemented by `GcsFileStorageService` in Infrastructure.

```csharp
/// <summary>Uploads binary content and returns the GCS storage path.</summary>
Task<string> UploadAsync(Stream content, string storagePath, string contentType, CancellationToken ct = default);

/// <summary>Downloads binary content for a given storage path.</summary>
Task DownloadAsync(string storagePath, Stream destination, CancellationToken ct = default);

/// <summary>Deletes the binary object from GCS (compensating action).</summary>
Task DeleteAsync(string storagePath, CancellationToken ct = default);
```

---

## Validation Rules

| Rule | Enforced In | Detail |
|------|-------------|--------|
| `FileName` non-empty | Domain (FileRecord.Create) | ArgumentException |
| `CaseId` non-empty | Domain (FileRecord.Create) | ArgumentException |
| `CustomerId` non-empty | Domain (FileRecord.Create) | ArgumentException |
| File size ≤ 50 MB | Application (FileService) | Returns validation error DTO before touching Infrastructure |
| ContentType in allow-list | Application (FileService) | Returns validation error DTO before touching Infrastructure |
| Valid lifecycle transition | Domain (FileRecord.TransitionStatus) | InvalidOperationException |
| `page` ≥ 1, `pageSize` between 1–100 | Application (FileService) | Clamped/defaulted rather than thrown |
