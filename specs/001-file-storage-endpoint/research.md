# Research: File Storage Endpoint

**Feature**: 001-file-storage-endpoint  
**Date**: 2026-03-17  
**Status**: Complete — all NEEDS CLARIFICATION markers resolved

---

## Resolved Clarifications

### CL-01: Lifecycle Transition Triggers

**Original marker**: Story 4 — "What triggers lifecycle transitions?"

**Decision**: Manual API calls from consumer systems.  
**Rationale**: The feature spec describes a REST API consumed by multiple systems. No mention of time-based rules or external system events exists in the requirements. Keeping transitions as explicit API calls (PATCH `/api/files/{id}/status`) matches the minimal viable scope and the existing `ProductsController` pattern where all mutations are explicit HTTP requests.  
**Alternatives considered**:
- Automated time-based rules (e.g., archive after 90 days) — rejected; adds scheduler/background-job infrastructure not mentioned in requirements.
- External system event (e.g., Case closed webhook) — rejected; no event bus exists in the current backend and scope is out of phase.

---

### CL-02: File Categories

**Original marker**: FR-016 — "Fixed list or dynamic management?"

**Decision**: Fixed predefined list, declared as a C# enum in the Domain layer.  
**Rationale**: The user description provides no indication of runtime category management. A fixed list (Invoice, Contract, Statement, Receipt, Agreement) is sufficient to classify financing documents, avoids a category management API surface, and follows the single-responsibility principle consistent with the existing codebase. Categories can be extended in a future phase.  
**Allowed values**: `Invoice`, `Contract`, `Statement`, `Receipt`, `Agreement`  
**Alternatives considered**:
- Dynamic categories stored in Firestore with CRUD endpoints — rejected; not needed in phase one, significantly wider scope.
- Freeform strings with no validation — rejected; breaks consistency across consumer systems.

---

## Technology Research

### File Metadata Storage: Google Cloud Firestore

**Decision**: Use Firestore as the metadata store for `FileRecord` documents.  
**NuGet package**: `Google.Cloud.Firestore` (v3.x)  
**Rationale**:
- Explicitly requested in `project plan.md`.
- Firestore is document-oriented — a `FileRecord` maps naturally to a single Firestore document.
- Supports composite querying with `WhereEqualTo` filters on `CaseId`, `CustomerId`, and `Category`, which covers all listing requirements (FR-009).
- Serverless, highly available, no schema migrations required.

**Implementation notes**:
- Collection name: `file-records`
- Document ID: `Guid.NewGuid().ToString()` (matches existing `Product` entity pattern)
- Pagination: Cursor-based using `StartAfter` with `OrderBy("UploadedAt")` + `Limit(pageSize)` — preferred over offset for large collections; for this phase, offset-based (`Offset` + `Limit`) is acceptable given low scale estimate and avoids cursor state management.
- Authentication to Firestore: Application Default Credentials (ADC) via `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to a service account JSON key.
- Firestore project ID: read from `appsettings.json` under `FileStorage:Firestore:ProjectId`.

**Alternatives considered**:
- PostgreSQL / SQL: Existing backend uses in-memory repo and no SQL infrastructure is present; adding SQL would require a migration toolchain. Rejected in favour of the explicit plan requirement.
- Redis: Not appropriate for document-level queries. Rejected.

---

### File Binary Storage: Google Cloud Storage (GCS)

**Decision**: Store binary file payloads as objects in a GCS bucket.  
**NuGet package**: `Google.Cloud.Storage.V1` (v4.x)  
**Rationale**:
- Explicitly requested in `project plan.md`.
- GCS is purpose-built for large binary object storage. Separating binary storage from metadata aligns with standard cloud patterns and allows independent scaling.
- Serving files via signed URLs is possible in a future phase for authenticated access.

**Object naming convention**: `{customerId}/{caseId}/{fileId}/{original-filename}`  
This ensures files are logically grouped by customer and case, avoids collisions across uploads of identically named files, and mirrors logical metadata structure.

**Bucket name**: Configurable via `appsettings.json` under `FileStorage:Gcs:BucketName`.

**Upload behaviour**:
- Upload is performed with `StorageClient.UploadObjectAsync` with the stream obtained from `IFormFile.OpenReadStream()`.
- If the upstream call to GCS succeeds but the subsequent Firestore write fails, the orphaned GCS object must be cleaned up. The Infrastructure layer's `GcsFileStorageService.DeleteAsync` handles this compensating action.

**Download behaviour**:
- Stream object content directly to the HTTP response via `StorageClient.DownloadObjectAsync` rather than buffering the entire file in memory.

**Alternatives considered**:
- Local disk storage: Not cloud-native; not portable across instances. Rejected per plan requirement.
- Azure Blob Storage / AWS S3: Not applicable; plan explicitly specifies GCS.

---

### .NET Project Structure: Mirroring Existing Pattern

**Decision**: Three new class library projects added to `Product.slnx`.  
**Rationale**: The existing backend follows a strict Clean Architecture pattern with four projects per domain module (`Domain`, `Application`, `Infrastructure`, `Api`). Adding `FileStorage.Domain`, `FileStorage.Application`, and `FileStorage.Infrastructure` alongside the existing `Product.*` projects ensures consistency, enforces layer separation, and keeps framework dependencies out of the domain.

**Reference pattern** (existing):
```
Product.Domain       → no external NuGet references
Product.Application  → references Product.Domain only
Product.Infrastructure → references Product.Domain + Google/DB packages
Product.Api          → references Product.Application + Product.Infrastructure
```

**New pattern** (mirrored):
```
FileStorage.Domain       → no external NuGet references
FileStorage.Application  → references FileStorage.Domain only
FileStorage.Infrastructure → references FileStorage.Domain + Google.Cloud.Firestore + Google.Cloud.Storage.V1
Product.Api              → also references FileStorage.Application + FileStorage.Infrastructure
```

---

### File Validation

**Decision**: Validate file size and MIME type in the Application layer's `FileService` before delegating to the Infrastructure layer.  
**Max file size**: 50 MB (52,428,800 bytes) — read from configuration `FileStorage:MaxFileSizeBytes`.  
**Allowed MIME types** (read from configuration `FileStorage:AllowedMimeTypes` array):
- `application/pdf`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX)
- `image/jpeg`
- `image/png`

**Rationale**: MIME types from `IFormFile.ContentType` can be spoofed by clients. For phase one, declared content type validation is sufficient; magic-byte validation can be added in a security hardening phase.

---

### Pagination

**Decision**: Offset-based pagination with `page` (1-based) and `pageSize` query parameters.  
**Default page size**: 20. **Maximum page size**: 100.  
**Rationale**: Consistent with simple REST conventions; Firestore supports `Offset` for small data sets. For large-scale needs, cursor-based pagination can replace this in a future phase.

---

## Summary Table

| Topic | Decision | Package / Version |
|-------|----------|-------------------|
| Metadata store | Google Cloud Firestore | `Google.Cloud.Firestore` 3.x |
| Binary store | Google Cloud Storage | `Google.Cloud.Storage.V1` 4.x |
| Project structure | 3 new projects mirroring Product.* pattern | — |
| Lifecycle triggers | Manual PATCH API call | — |
| File categories | Fixed enum (5 values) | — |
| File size limit | 50 MB | Configurable |
| MIME validation | Declared content type | Configurable allow-list |
| Pagination | Offset-based, page+pageSize | — |
| Auth | None (phase 1 explicit) | — |
