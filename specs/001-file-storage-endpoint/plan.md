# Implementation Plan: File Storage Endpoint

**Branch**: `001-file-storage-endpoint` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-file-storage-endpoint/spec.md`

## Summary

Extend the existing ASP.NET Core (.NET 10) Clean Architecture backend with a new File Storage module. Consumer systems in the Financing Department can upload, retrieve, list, and lifecycle-manage files. Each file is associated with a Case ID, Customer ID, and a category. Binary file payloads are stored in **Google Cloud Storage (GCS)**; structured metadata is stored in **Google Cloud Firestore**. No authentication is required in this phase. The new module mirrors the existing `Product.*` project structure, adding three new class library projects (`FileStorage.Domain`, `FileStorage.Application`, `FileStorage.Infrastructure`) and a new controller in the existing `Product.Api` project.

## Technical Context

**Language/Version**: C# 13 / .NET 10.0  
**Primary Dependencies**: ASP.NET Core 10, `Google.Cloud.Firestore` (3.x), `Google.Cloud.Storage.V1` (4.x), Swashbuckle.AspNetCore (10.x)  
**Storage**: Google Cloud Firestore (file metadata), Google Cloud Storage (binary file blobs)  
**Testing**: xUnit — no test projects exist in the current solution; test projects are out of scope for this plan but file structure includes placeholder paths  
**Target Platform**: Linux/macOS server — ASP.NET Core hosted web service (same host as existing Product.Api)  
**Project Type**: web-service (REST API extension to existing monorepo backend)  
**Performance Goals**: File retrieval ≤ 3 s for files up to 50 MB; metadata list response ≤ 2 s per page  
**Constraints**: Max file size 50 MB; only PDF, DOCX, XLSX, JPEG, PNG accepted; soft-delete enforced; no authentication; paginated list (default 20, max 100 per page)  
**Scale/Scope**: Multiple internal consumer systems from Financing Department; estimated low-to-medium concurrent load in first phase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles derived from the existing `monorepo/backend` codebase:

| Principle | Status | Notes |
|-----------|--------|-------|
| Clean Architecture layers: Domain → Application → Infrastructure → Api | ✅ PASS | New `FileStorage.*` projects follow the same 4-layer pattern |
| Repository pattern for all data access | ✅ PASS | `IFileRepository` in Domain; Firestore implementation in Infrastructure |
| Dependency injection via constructor (no service locator) | ✅ PASS | All services registered in `Program.cs` via DI |
| Async/await on every I/O operation | ✅ PASS | All repository and service methods are `Task<T>` |
| Factory methods on Domain entities; no public setters | ✅ PASS | `FileRecord.Create(...)` factory method enforces invariants |
| No direct framework references in Domain or Application layers | ✅ PASS | `Google.Cloud.*` packages are Infrastructure-only |
| No circular project references | ✅ PASS | Api → Application + Infrastructure; Application → Domain; Infrastructure → Domain |
| Single responsibility per controller | ✅ PASS | New `FilesController` handles only file operations |

**Post-Phase-1 re-check**: All gates still pass — no violations introduced by design.

## Project Structure

### Documentation (this feature)

```text
specs/001-file-storage-endpoint/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── rest-api.md      ← Phase 1 output
└── tasks.md             ← Phase 2 output (created by /speckit.tasks — NOT this command)
```

### Source Code (repository)

```text
monorepo/backend/
├── Product.slnx                            ← add 3 new project references here
└── src/
    ├── Product.Api/                        ← EXISTING — add FilesController + DI registrations
    │   ├── Controllers/
    │   │   ├── ProductsController.cs       (existing)
    │   │   └── FilesController.cs          ← NEW
    │   ├── appsettings.json                ← NEW — add GCS + Firestore config sections
    │   └── Program.cs                      ← NEW — register FileStorage DI services
    │
    ├── FileStorage.Domain/                 ← NEW PROJECT
    │   ├── FileStorage.Domain.csproj
    │   ├── Entities/
    │   │   └── FileRecord.cs
    │   ├── Enums/
    │   │   ├── FileCategory.cs
    │   │   └── FileLifecycleStatus.cs
    │   └── Interfaces/
    │       ├── IFileRepository.cs
    │       └── IFileStorageService.cs
    │
    ├── FileStorage.Application/            ← NEW PROJECT
    │   ├── FileStorage.Application.csproj
    │   ├── DTOs/
    │   │   ├── FileMetadataDto.cs
    │   │   ├── FileListRequest.cs
    │   │   ├── FileListResponse.cs
    │   │   └── UpdateFileStatusRequest.cs
    │   ├── Interfaces/
    │   │   └── IFileService.cs
    │   └── Services/
    │       └── FileService.cs
    │
    └── FileStorage.Infrastructure/         ← NEW PROJECT
        ├── FileStorage.Infrastructure.csproj
        ├── Configuration/
        │   ├── FirestoreOptions.cs
        │   └── GcsOptions.cs
        ├── Repositories/
        │   └── FirestoreFileRepository.cs
        └── Storage/
            └── GcsFileStorageService.cs
```

**Structure Decision**: Mirrors the existing `Product.*` four-project Clean Architecture pattern exactly. Three new class library projects (`FileStorage.Domain`, `FileStorage.Application`, `FileStorage.Infrastructure`) are added to the existing `Product.slnx` solution. The API entry point (`Product.Api`) gains one new controller and DI registrations — no new host process needed.

## Complexity Tracking

> No constitution violations — table not required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
