# Tasks: File Storage Endpoint

**Input**: Design documents from `/specs/001-file-storage-endpoint/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/rest-api.md ✅  
**Tests**: Not requested — no test tasks included.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Paths are relative to `monorepo/backend/`

---

## Phase 1: Setup

**Purpose**: Create the three new class library projects, wire them into the solution, and add NuGet packages. No user story work can begin until all projects build.

- [ ] T001 Create `FileStorage.Domain` class library project at `monorepo/backend/src/FileStorage.Domain/FileStorage.Domain.csproj` targeting net10.0 with Nullable enable and ImplicitUsings enable
- [ ] T002 [P] Create `FileStorage.Application` class library project at `monorepo/backend/src/FileStorage.Application/FileStorage.Application.csproj` targeting net10.0 with a ProjectReference to FileStorage.Domain
- [ ] T003 [P] Create `FileStorage.Infrastructure` class library project at `monorepo/backend/src/FileStorage.Infrastructure/FileStorage.Infrastructure.csproj` targeting net10.0 with a ProjectReference to FileStorage.Domain; add PackageReference to `Google.Cloud.Firestore` (3.x) and `Google.Cloud.Storage.V1` (4.x)
- [ ] T004 Add ProjectReferences for FileStorage.Application and FileStorage.Infrastructure to `monorepo/backend/src/Product.Api/Product.Api.csproj`
- [ ] T005 Register all three new projects in `monorepo/backend/Product.slnx`
- [ ] T006 Run `dotnet build` from `monorepo/backend/` and confirm zero errors before proceeding

**Checkpoint**: All projects build cleanly. Phase 2 can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain layer, configuration options, and infrastructure wiring that every user story depends on. Must be complete before any story work can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Create enum `FileLifecycleStatus` (Active, Archived, Deleted) in `monorepo/backend/src/FileStorage.Domain/Enums/FileLifecycleStatus.cs`
- [ ] T008 [P] Create enum `FileCategory` (Invoice, Contract, Statement, Receipt, Agreement) in `monorepo/backend/src/FileStorage.Domain/Enums/FileCategory.cs`
- [ ] T009 Create `FileRecord` aggregate root entity with private constructor, all fields from data-model.md (Id, FileName, ContentType, FileSizeBytes, StoragePath, CaseId, CustomerId, Category, Status, UploadedAt, StatusChangedAt), factory method `FileRecord.Create(...)` that validates all string arguments and sets initial Active status, and `TransitionStatus(FileLifecycleStatus)` business method that enforces the state machine rules (Active→Archived ✅, Active→Deleted ✅, Archived→Deleted ✅, all others ❌ InvalidOperationException) in `monorepo/backend/src/FileStorage.Domain/Entities/FileRecord.cs`
- [ ] T010 [P] Create domain interface `IFileRepository` with methods CreateAsync, GetByIdAsync, UpdateAsync, ListAsync (with caseId, customerId, category, page, pageSize parameters returning tuple of items + totalCount) in `monorepo/backend/src/FileStorage.Domain/Interfaces/IFileRepository.cs`
- [ ] T011 [P] Create domain interface `IFileStorageService` with methods UploadAsync, DownloadAsync, DeleteAsync in `monorepo/backend/src/FileStorage.Domain/Interfaces/IFileStorageService.cs`
- [ ] T012 Create configuration options class `FirestoreOptions` with property `ProjectId` in `monorepo/backend/src/FileStorage.Infrastructure/Configuration/FirestoreOptions.cs`
- [ ] T013 [P] Create configuration options class `GcsOptions` with property `BucketName` in `monorepo/backend/src/FileStorage.Infrastructure/Configuration/GcsOptions.cs`
- [ ] T014 Add `FileStorage` configuration section to `monorepo/backend/src/Product.Api/appsettings.json` with keys: `Firestore:ProjectId`, `Gcs:BucketName`, `MaxFileSizeBytes` (52428800), `AllowedMimeTypes` array (pdf, docx, xlsx, jpeg, png MIME types)
- [ ] T015 Register `FirestoreOptions` and `GcsOptions` via `services.Configure<T>()` and register `IFileRepository` → `FirestoreFileRepository` and `IFileStorageService` → `GcsFileStorageService` DI bindings in `monorepo/backend/src/Product.Api/Program.cs` — **do not register `IFileService` here; that binding is added in T017 once `FileService` is defined**

**Checkpoint**: Domain entities, enums, interfaces, config options, and infrastructure DI registrations are in place. Phase 3 (US1) can now begin.

---

## Phase 3: User Story 1 — Upload File for a Case (Priority: P1) 🎯 MVP

**Goal**: A consumer can `POST /api/files` with a file, CaseId, CustomerId, and Category and receive a `201 Created` response with the file's metadata including its unique ID.

**Independent Test**: `POST /api/files` with a valid PDF, CaseId=CASE-101, CustomerId=CUST-001, Category=Invoice → `201 Created` with a UUID in the `id` field.

- [ ] T016 [P] [US1] Create DTO `FileMetadataDto` (all FileRecord fields as public properties, Category and Status as string) in `monorepo/backend/src/FileStorage.Application/DTOs/FileMetadataDto.cs`
- [ ] T017 [P] [US1] Create application interface `IFileService` with method signature `UploadFileAsync(IFormFile file, string caseId, string customerId, string category)` returning `Task<FileMetadataDto>` in `monorepo/backend/src/FileStorage.Application/Interfaces/IFileService.cs`; also add `services.AddScoped<IFileService, FileService>()` DI registration to `monorepo/backend/src/Product.Api/Program.cs`
- [ ] T018 [US1] Implement `GcsFileStorageService` that wraps `Google.Cloud.Storage.V1.StorageClient`: `UploadAsync` accepts a `Stream` (the Application layer must call `IFormFile.OpenReadStream()` before calling this method — `IFormFile` must NOT be referenced inside `FileStorage.Infrastructure`), uploads the stream to the configured GCS bucket at path `{customerId}/{caseId}/{fileId}/{fileName}`, and returns the storage path; `DownloadAsync` streams object content to a provided destination stream; `DeleteAsync` removes the GCS object (compensating action on failed Firestore write) in `monorepo/backend/src/FileStorage.Infrastructure/Storage/GcsFileStorageService.cs`
- [ ] T019 [US1] Implement `FirestoreFileRepository.CreateAsync` that serialises a `FileRecord` to a Firestore document in the `file-records` collection using `Google.Cloud.Firestore.FirestoreDb` obtained from DI; document ID is `fileRecord.Id.ToString()` in `monorepo/backend/src/FileStorage.Infrastructure/Repositories/FirestoreFileRepository.cs`
- [ ] T020 [US1] Implement `FileService.UploadFileAsync`: validate file size against `MaxFileSizeBytes` config (400 if exceeded), validate ContentType against `AllowedMimeTypes` config (400 if disallowed) using `IFormFile.ContentType`, validate caseId/customerId/category non-empty (400 if missing), parse category string to `FileCategory` enum (400 if invalid), generate `var fileId = Guid.NewGuid()` once and use it for both the storagePath (`{customerId}/{caseId}/{fileId}/{fileName}`) and as the ID passed to `FileRecord.Create(...)`, call `IFormFile.OpenReadStream()` and pass the resulting `Stream` to `IFileStorageService.UploadAsync`, call `FileRecord.Create(...)`, call `IFileRepository.CreateAsync`, on any Firestore failure call `IFileStorageService.DeleteAsync` as compensating action, return mapped `FileMetadataDto` in `monorepo/backend/src/FileStorage.Application/Services/FileService.cs`
- [ ] T021 [US1] Create `FilesController` with `[ApiController]`, `[Route("api/[controller]")]`, inject `IFileService` and `ILogger<FilesController>`, implement `POST /api/files` action accepting `[FromForm] IFormFile file, [FromForm] string caseId, [FromForm] string customerId, [FromForm] string category`, delegate to `FileService.UploadFileAsync`, return `CreatedAtAction` with `FileMetadataDto` on success, return `400` on validation errors, `500` on unexpected errors in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T022 [US1] Run `dotnet build` and call `POST /api/files` with a test PDF via curl per quickstart.md step 4.1; verify `201 Created` with valid JSON and UUID id

**Checkpoint**: User Story 1 is fully functional. A consumer can upload a file and get back a file ID.

---

## Phase 4: User Story 2 — Retrieve a Stored File (Priority: P2)

**Goal**: A consumer can call `GET /api/files/{id}/metadata` to retrieve file metadata and `GET /api/files/{id}/content` to download the binary. Deleted files return 404.

**Independent Test**: Upload a file (Story 1), then `GET /api/files/{id}/metadata` → `200 OK` with matching metadata; `GET /api/files/{id}/content` → `200 OK` with binary and correct `Content-Disposition` header.

- [ ] T023 [P] [US2] Implement `FileService.GetMetadataAsync(Guid id)`: call `IFileRepository.GetByIdAsync`, return null (404) if not found or if status is Deleted, otherwise return mapped `FileMetadataDto` — add method signature to `IFileService` and implementation to `FileService` in `monorepo/backend/src/FileStorage.Application/Services/FileService.cs` and `monorepo/backend/src/FileStorage.Application/Interfaces/IFileService.cs`
- [ ] T024 [US2] Implement `FirestoreFileRepository.GetByIdAsync(Guid id)`: look up document by ID in `file-records` collection, deserialise to `FileRecord`, return null if not found in `monorepo/backend/src/FileStorage.Infrastructure/Repositories/FirestoreFileRepository.cs`
- [ ] T025 [P] [US2] Implement `FileService.DownloadFileAsync(Guid id)`: call `IFileRepository.GetByIdAsync`, return null (404) if not found or status is Deleted, call `IFileStorageService.DownloadAsync` streaming result to caller — add method to `IFileService` and implementation in `monorepo/backend/src/FileStorage.Application/Services/FileService.cs` and `monorepo/backend/src/FileStorage.Application/Interfaces/IFileService.cs`
- [ ] T026 [US2] Add `GET /api/files/{id}/metadata` action to `FilesController`: delegate to `FileService.GetMetadataAsync`, return `200 Ok(dto)` or `404 NotFound` in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T027 [US2] Add `GET /api/files/{id}/content` action to `FilesController`: delegate to `FileService.DownloadFileAsync`, return `FileStreamResult` with correct `ContentType` and `Content-Disposition: attachment; filename="{fileName}"` header, or `404 NotFound` in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T028 [US2] Verify via curl per quickstart.md steps 4.2 and 4.3: metadata returns correct fields; downloaded file matches the uploaded original

**Checkpoint**: User Stories 1 and 2 are both fully functional. Files can be uploaded and retrieved.

---

## Phase 5: User Story 3 — List Files by Case or Customer (Priority: P3)

**Goal**: A consumer can call `GET /api/files?caseId=X&page=1&pageSize=20` and receive a paginated list of file metadata. Deleted files are excluded; Archived files excluded unless `includeArchived=true`. At least one of caseId or customerId must be provided.

**Independent Test**: Upload 3 files with caseId=CASE-101 and 1 with caseId=CASE-202, then `GET /api/files?caseId=CASE-101` → `200 OK` with `totalCount: 3` and 3 items, none with caseId=CASE-202.

- [ ] T029 [P] [US3] Create DTO `FileListRequest` with properties CaseId (string?), CustomerId (string?), Category (string?), IncludeArchived (bool, default false), Page (int, default 1), PageSize (int, default 20, max 100) in `monorepo/backend/src/FileStorage.Application/DTOs/FileListRequest.cs`
- [ ] T030 [P] [US3] Create DTO `FileListResponse` with properties Items (IReadOnlyList\<FileMetadataDto\>), Page (int), PageSize (int), TotalCount (int) in `monorepo/backend/src/FileStorage.Application/DTOs/FileListResponse.cs`
- [ ] T031 [US3] Implement `FirestoreFileRepository.ListAsync(string? caseId, string? customerId, FileCategory? category, int page, int pageSize)`: build Firestore query on `file-records` collection adding `WhereEqualTo` filters for each non-null argument, always add `WhereNotEqualTo("status", "Deleted")` (exclude deleted); apply `.Offset((page-1)*pageSize).Limit(pageSize)`; run a separate count query for TotalCount; return tuple in `monorepo/backend/src/FileStorage.Infrastructure/Repositories/FirestoreFileRepository.cs`
- [ ] T032 [US3] Implement `FileService.ListFilesAsync(FileListRequest request)`: validate that at least one of CaseId or CustomerId is non-empty (400 if both empty), clamp PageSize to 1–100, parse optional Category string to enum, pass `includeArchived` flag by adding status filter when false, delegate to `IFileRepository.ListAsync`, map results to `FileListResponse` — add method to `IFileService` and implementation in `monorepo/backend/src/FileStorage.Application/Services/FileService.cs` and `monorepo/backend/src/FileStorage.Application/Interfaces/IFileService.cs`
- [ ] T033 [US3] Add `GET /api/files` action to `FilesController` binding `[FromQuery] FileListRequest request`, delegate to `FileService.ListFilesAsync`, return `200 Ok(FileListResponse)` or `400 BadRequest` if validation fails in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T034 [US3] Verify via curl per quickstart.md step 4.4: list by caseId returns correct items; empty list (not 404) when no matches; 400 when neither caseId nor customerId supplied

**Checkpoint**: User Stories 1, 2, and 3 are all fully functional.

---

## Phase 6: User Story 4 — Update File Lifecycle Status (Priority: P4)

**Goal**: A consumer can call `PATCH /api/files/{id}/status` with `{"status":"Archived"}` or `{"status":"Deleted"}` to transition the file's lifecycle state. Invalid transitions return 409. Deleted files return 404 on subsequent GET calls.

**Independent Test**: Upload a file → `PATCH /api/files/{id}/status` with `{"status":"Archived"}` → `200 OK` with `status: "Archived"` and updated `statusChangedAt`; then `PATCH` with `{"status":"Deleted"}` → `200 OK`; then `GET /api/files/{id}/metadata` → `404 Not Found`.

- [ ] T035 [P] [US4] Create DTO `UpdateFileStatusRequest` with required `[Required] string Status` property in `monorepo/backend/src/FileStorage.Application/DTOs/UpdateFileStatusRequest.cs`
- [ ] T036 [US4] Implement `FirestoreFileRepository.UpdateAsync(FileRecord fileRecord)`: write all fields of the FileRecord back to the existing Firestore document (merge/set), return the updated record in `monorepo/backend/src/FileStorage.Infrastructure/Repositories/FirestoreFileRepository.cs`
- [ ] T037 [US4] Implement `FileService.UpdateStatusAsync(Guid id, string newStatus)`: call `IFileRepository.GetByIdAsync` (404 if not found or already Deleted), parse newStatus string to `FileLifecycleStatus` enum (400 if unrecognised), call `fileRecord.TransitionStatus(newStatus)` (catch InvalidOperationException and return 409 with the exception message), call `IFileRepository.UpdateAsync`, return mapped `FileMetadataDto` — **do NOT call `IFileStorageService.DeleteAsync` on a soft-delete; the GCS binary is retained (SC-007)** — add method to `IFileService` and implementation in `monorepo/backend/src/FileStorage.Application/Services/FileService.cs` and `monorepo/backend/src/FileStorage.Application/Interfaces/IFileService.cs`
- [ ] T038 [US4] Add `PATCH /api/files/{id}/status` action to `FilesController` accepting `[FromBody] UpdateFileStatusRequest request`, delegate to `FileService.UpdateStatusAsync`, return `200 Ok(dto)` on success, `404 NotFound`, `409 Conflict`, or `400 BadRequest` as appropriate in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T039 [US4] Verify via curl per quickstart.md steps 4.5–4.8: archive succeeds; delete succeeds; re-fetch of deleted file returns 404; invalid transition (e.g., Deleted→Active) returns 409 with descriptive message

**Checkpoint**: All four user stories are fully functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, observability, and production-readiness details that affect all stories.

- [ ] T040 [P] Add Swagger XML documentation comments to all `FilesController` actions (summary, param, response codes) matching the contract in `contracts/rest-api.md` in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T041 [P] Add Firestore composite index definitions to `monorepo/backend/firestore.indexes.json` for all 6 index combinations defined in data-model.md (caseId+uploadedAt, customerId+uploadedAt, caseId+category+uploadedAt, customerId+category+uploadedAt, caseId+customerId+uploadedAt, caseId+customerId+category+uploadedAt)
- [ ] T042 Verify consistent error response shape across all `FilesController` actions — all 400/404/409/500 responses must use `{ "error": "...", "details": [...] }` structure matching `contracts/rest-api.md` in `monorepo/backend/src/Product.Api/Controllers/FilesController.cs`
- [ ] T043 Run full quickstart.md end-to-end verification (steps 4.1 through 4.8 and step 5) against a live GCP project and confirm all expected status codes and response shapes

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Can Parallelise Within |
|-------|-----------|------------------------|
| Phase 1 — Setup | Nothing | T002, T003 with T001 |
| Phase 2 — Foundational | Phase 1 complete | T008 ‖ T010 ‖ T011 ‖ T013 with T007, T009, T012 |
| Phase 3 — US1 | Phase 2 complete | T016 ‖ T017 with T018 → T019 → T020 → T021 |
| Phase 4 — US2 | Phase 3 complete* | T023 ‖ T025 → T024 → T026 ‖ T027 |
| Phase 5 — US3 | Phase 4 complete* | T029 ‖ T030 → T031 → T032 → T033 |
| Phase 6 — US4 | Phase 5 complete* | T035 → T036 → T037 → T038 |
| Phase 7 — Polish | Phase 6 complete | T040 ‖ T041 independently |

*Each user story phase can technically start after Phase 2, but each depends on the `IFileRepository` implementation from the previous story phase being in place for realistic integration.

### User Story Dependencies

- **US1**: No dependency on other stories. Pure create path.
- **US2**: Depends on US1 for `FirestoreFileRepository.GetByIdAsync` being implemented (shared Infrastructure file).
- **US3**: Depends on US2 for `ListAsync` being added to the same `FirestoreFileRepository`.
- **US4**: Depends on US2+US3 for `UpdateAsync` being added to `FirestoreFileRepository`.

### Parallel Opportunities Per Story

**Story 1 parallel opportunities**:
```
T016 (FileMetadataDto)    ─┐
T017 (IFileService)        ├─► T018 (GcsFileStorageService) ─► T019 (Firestore CreateAsync) ─► T020 (FileService.Upload) ─► T021 (FilesController POST) ─► T022
```

**Story 3 parallel opportunities**:
```
T029 (FileListRequest)  ─┐
T030 (FileListResponse) ─┴─► T031 (Firestore ListAsync) ─► T032 (FileService.List) ─► T033 (Controller GET list) ─► T034
```

---

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1 — Upload only)  
Delivers a working upload endpoint integrated with GCS and Firestore. Proves the infrastructure wiring. Can be demonstrated to Financing Department independently.

**Incremental delivery order**:
1. Phase 1–2 (Setup + Foundation) — required before anything works
2. Phase 3 (US1 — Upload) — MVP
3. Phase 4 (US2 — Retrieve) — completes core store-and-retrieve loop
4. Phase 5 (US3 — List) — enables case/customer discovery
5. Phase 6 (US4 — Lifecycle) — compliance and housekeeping layer
6. Phase 7 (Polish) — production-readiness

---

## Summary

| Phase | Tasks | Story | Parallelisable |
|-------|-------|-------|----------------|
| 1 — Setup | T001–T006 | — | T002, T003 |
| 2 — Foundational | T007–T015 | — | T008, T010, T011, T013 |
| 3 — US1 Upload | T016–T022 | US1 (P1) | T016, T017 |
| 4 — US2 Retrieve | T023–T028 | US2 (P2) | T023, T025 / T026, T027 |
| 5 — US3 List | T029–T034 | US3 (P3) | T029, T030 |
| 6 — US4 Lifecycle | T035–T039 | US4 (P4) | T035 |
| 7 — Polish | T040–T043 | — | T040, T041 |
| **Total** | **43 tasks** | | |
