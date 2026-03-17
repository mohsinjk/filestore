# REST API Contract: File Storage Endpoint

**Feature**: 001-file-storage-endpoint  
**Date**: 2026-03-17  
**Base URL**: `/api/files`  
**Format**: JSON for metadata responses; `multipart/form-data` for upload; binary stream for download  
**Authentication**: None (phase 1)

---

## Common Response Envelopes

### Error Response

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "details": ["Optional array of field-level validation messages"]
}
```

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200 OK` | Successful read, update, or list |
| `201 Created` | File successfully uploaded |
| `400 Bad Request` | Validation failure (missing fields, bad type, size exceeded) |
| `404 Not Found` | File ID does not exist, or file is soft-deleted |
| `409 Conflict` | Invalid lifecycle transition requested |
| `500 Internal Server Error` | Unexpected server error |

---

## Endpoints

---

### POST /api/files — Upload a File

Stores a new file linked to a Case and Customer.

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File (binary) | Yes | The file payload. Max 50 MB. |
| `caseId` | string | Yes | Identifier of the related Case. |
| `customerId` | string | Yes | Identifier of the related Customer. |
| `category` | string | Yes | One of: `Invoice`, `Contract`, `Statement`, `Receipt`, `Agreement` |

**Success Response**: `201 Created`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fileName": "invoice-2026-03.pdf",
  "contentType": "application/pdf",
  "fileSizeBytes": 204800,
  "caseId": "CASE-101",
  "customerId": "CUST-001",
  "category": "Invoice",
  "status": "Active",
  "uploadedAt": "2026-03-17T10:00:00Z",
  "statusChangedAt": "2026-03-17T10:00:00Z"
}
```

**Error Responses**:

`400 Bad Request` — missing or invalid fields:
```json
{
  "error": "Validation failed.",
  "details": ["caseId is required.", "category must be one of: Invoice, Contract, Statement, Receipt, Agreement."]
}
```

`400 Bad Request` — file too large:
```json
{
  "error": "File size exceeds the maximum allowed limit of 50 MB."
}
```

`400 Bad Request` — unsupported file type:
```json
{
  "error": "File type 'text/plain' is not permitted. Allowed types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, image/jpeg, image/png."
}
```

---

### GET /api/files/{id}/metadata — Get File Metadata

Returns the metadata for a file by its ID. Does **not** return the binary content.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The file's unique identifier. |

**Success Response**: `200 OK`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fileName": "invoice-2026-03.pdf",
  "contentType": "application/pdf",
  "fileSizeBytes": 204800,
  "caseId": "CASE-101",
  "customerId": "CUST-001",
  "category": "Invoice",
  "status": "Active",
  "uploadedAt": "2026-03-17T10:00:00Z",
  "statusChangedAt": "2026-03-17T10:00:00Z"
}
```

**Error Responses**:

`404 Not Found`:
```json
{
  "error": "File with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found."
}
```

---

### GET /api/files/{id}/content — Download File Binary

Returns the raw binary content of the file as a byte stream.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The file's unique identifier. |

**Success Response**: `200 OK`

- `Content-Type`: MIME type of the stored file (e.g., `application/pdf`)
- `Content-Disposition`: `attachment; filename="invoice-2026-03.pdf"`
- Body: binary file stream

**Error Responses**:

`404 Not Found`:
```json
{
  "error": "File with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found."
}
```

---

### GET /api/files — List Files (with filters and pagination)

Returns a paginated list of file **metadata** (not file content) matching the given filters. Files with status `Deleted` are never returned. Files with status `Archived` are excluded unless `includeArchived=true` is specified.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `caseId` | string | Conditional* | — | Filter by Case ID. |
| `customerId` | string | Conditional* | — | Filter by Customer ID. |
| `category` | string | No | — | Filter by category. One of: `Invoice`, `Contract`, `Statement`, `Receipt`, `Agreement`. |
| `includeArchived` | boolean | No | `false` | When `true`, includes files with `Archived` status. |
| `page` | integer | No | `1` | 1-based page number. |
| `pageSize` | integer | No | `20` | Number of results per page. Min 1, max 100. |

*At least one of `caseId` or `customerId` must be provided.*

**Success Response**: `200 OK`

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fileName": "invoice-2026-03.pdf",
      "contentType": "application/pdf",
      "fileSizeBytes": 204800,
      "caseId": "CASE-101",
      "customerId": "CUST-001",
      "category": "Invoice",
      "status": "Active",
      "uploadedAt": "2026-03-17T10:00:00Z",
      "statusChangedAt": "2026-03-17T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 1
}
```

**Error Responses**:

`400 Bad Request` — neither `caseId` nor `customerId` provided:
```json
{
  "error": "At least one of 'caseId' or 'customerId' must be provided."
}
```

---

### PATCH /api/files/{id}/status — Update File Lifecycle Status

Transitions the lifecycle status of a file.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The file's unique identifier. |

**Request Body**: `application/json`

```json
{
  "status": "Archived"
}
```

`status` must be one of: `Archived`, `Deleted`.  
(Transitioning back to `Active` is not supported in phase 1.)

**Success Response**: `200 OK`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fileName": "invoice-2026-03.pdf",
  "contentType": "application/pdf",
  "fileSizeBytes": 204800,
  "caseId": "CASE-101",
  "customerId": "CUST-001",
  "category": "Invoice",
  "status": "Archived",
  "uploadedAt": "2026-03-17T10:00:00Z",
  "statusChangedAt": "2026-03-17T11:30:00Z"
}
```

**Error Responses**:

`404 Not Found`:
```json
{
  "error": "File with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found."
}
```

`409 Conflict` — invalid transition:
```json
{
  "error": "Cannot transition file status from 'Deleted' to 'Active'. Allowed transitions from 'Deleted': none."
}
```

---

## Endpoint Summary

| Method | Path | Description | Success Code |
|--------|------|-------------|--------------|
| `POST` | `/api/files` | Upload a file | `201 Created` |
| `GET` | `/api/files/{id}/metadata` | Get file metadata | `200 OK` |
| `GET` | `/api/files/{id}/content` | Download file binary | `200 OK` |
| `GET` | `/api/files` | List files with filters | `200 OK` |
| `PATCH` | `/api/files/{id}/status` | Update lifecycle status | `200 OK` |

---

## DTO Schemas (Application Layer)

### FileMetadataDto

```csharp
public class FileMetadataDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string CaseId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public DateTime StatusChangedAt { get; set; }
}
```

### FileListResponse

```csharp
public class FileListResponse
{
    public IReadOnlyList<FileMetadataDto> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}
```

### UpdateFileStatusRequest

```csharp
public class UpdateFileStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
```
