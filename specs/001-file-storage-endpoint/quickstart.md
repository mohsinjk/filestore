# Quickstart: File Storage Endpoint

**Feature**: 001-file-storage-endpoint  
**Date**: 2026-03-17  
**Purpose**: Guide for running the File Storage feature locally and verifying it end-to-end

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| .NET SDK | 10.0+ | `dotnet --version` to verify |
| Google Cloud SDK (`gcloud`) | Latest | Required for ADC (Application Default Credentials) |
| GCP Project | — | Must have Firestore (Native mode) and Cloud Storage enabled |
| GCS Bucket | — | Create one in your GCP project |
| Service Account | — | With roles: `roles/datastore.user`, `roles/storage.objectAdmin` |

---

## 1. GCP Setup

### 1a. Enable APIs

```bash
gcloud services enable firestore.googleapis.com storage.googleapis.com
```

### 1b. Create Firestore Database (Native mode)

```bash
gcloud firestore databases create --location=europe-west1
```

*(Replace `europe-west1` with your preferred region.)*

### 1c. Create GCS Bucket

```bash
gcloud storage buckets create gs://my-filestore-bucket --location=EUROPE-WEST1
```

### 1d. Create Service Account and Key

```bash
gcloud iam service-accounts create filestore-sa \
  --display-name="File Store Service Account"

gcloud projects add-iam-policy-binding YOUR_GCP_PROJECT_ID \
  --member="serviceAccount:filestore-sa@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding YOUR_GCP_PROJECT_ID \
  --member="serviceAccount:filestore-sa@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud iam service-accounts keys create ./sa-key.json \
  --iam-account=filestore-sa@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com
```

> **Security note**: Never commit `sa-key.json` to source control. Add it to `.gitignore`.

---

## 2. Configure the Application

Add the following sections to `monorepo/backend/src/Product.Api/appsettings.json` (or use `appsettings.Development.json` for local override):

```json
{
  "FileStorage": {
    "Firestore": {
      "ProjectId": "YOUR_GCP_PROJECT_ID"
    },
    "Gcs": {
      "BucketName": "my-filestore-bucket"
    },
    "MaxFileSizeBytes": 52428800,
    "AllowedMimeTypes": [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png"
    ]
  }
}
```

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your service account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/monorepo/backend/sa-key.json"
```

---

## 3. Build and Run

```bash
cd monorepo/backend
dotnet restore
dotnet build
cd src/Product.Api
dotnet run
```

The API will be available at `http://localhost:5000`. Swagger UI is at `http://localhost:5000/swagger`.

---

## 4. Verify End-to-End

### 4.1 Upload a File

```bash
curl -X POST http://localhost:5000/api/files \
  -F "file=@/path/to/test.pdf;type=application/pdf" \
  -F "caseId=CASE-101" \
  -F "customerId=CUST-001" \
  -F "category=Invoice"
```

**Expected**: `201 Created` with a JSON body containing a `id` (UUID).

Save the returned `id` for subsequent calls:
```bash
FILE_ID="3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### 4.2 Get File Metadata

```bash
curl http://localhost:5000/api/files/$FILE_ID/metadata
```

**Expected**: `200 OK` with metadata JSON. `status` should be `"Active"`.

### 4.3 Download File Content

```bash
curl -o downloaded.pdf http://localhost:5000/api/files/$FILE_ID/content
```

**Expected**: `200 OK`, file saved locally as `downloaded.pdf`.

### 4.4 List Files

```bash
curl "http://localhost:5000/api/files?caseId=CASE-101&page=1&pageSize=20"
```

**Expected**: `200 OK` with an `items` array containing the uploaded file.

### 4.5 Archive the File

```bash
curl -X PATCH http://localhost:5000/api/files/$FILE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Archived"}'
```

**Expected**: `200 OK` with `status` now `"Archived"`.

### 4.6 Verify Archived File Is Excluded from Default Listing

```bash
curl "http://localhost:5000/api/files?caseId=CASE-101"
```

**Expected**: `items` array is empty (Archived files excluded by default).

With `includeArchived=true`:
```bash
curl "http://localhost:5000/api/files?caseId=CASE-101&includeArchived=true"
```

**Expected**: File appears with `status: "Archived"`.

### 4.7 Soft-Delete the File

```bash
curl -X PATCH http://localhost:5000/api/files/$FILE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Deleted"}'
```

**Expected**: `200 OK` with `status: "Deleted"`.

### 4.8 Verify Deleted File Is Not Accessible

```bash
curl http://localhost:5000/api/files/$FILE_ID/metadata
```

**Expected**: `404 Not Found`.

---

## 5. Verify Invalid Transition Is Rejected

```bash
curl -X PATCH http://localhost:5000/api/files/$FILE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Active"}'
```

**Expected**: `409 Conflict` with an error message describing the invalid transition.

---

## 6. Configuration Reference

| Key | Description | Example |
|-----|-------------|---------|
| `FileStorage:Firestore:ProjectId` | GCP project ID | `my-gcp-project` |
| `FileStorage:Gcs:BucketName` | GCS bucket name | `my-filestore-bucket` |
| `FileStorage:MaxFileSizeBytes` | Maximum upload size (bytes) | `52428800` (50 MB) |
| `FileStorage:AllowedMimeTypes` | JSON array of accepted MIME types | See section 2 |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account key JSON | `/path/to/sa-key.json` |
