export type FileCategory = 'Invoice' | 'Contract' | 'Statement' | 'Receipt' | 'Agreement';

export type FileStatus = 'Active' | 'Archived' | 'Deleted';

export type FileMetadataDto = {
    id: string;
    fileName: string;
    contentType: string;
    fileSizeBytes: number;
    caseId: string;
    customerId: string;
    category: FileCategory;
    status: FileStatus;
    uploadedAt: string;
    statusChangedAt: string;
};

export type UploadFileRequest = {
    file: File;
    caseId: string;
    customerId: string;
    category: FileCategory;
};

export type FileListRequest = {
    caseId?: string;
    customerId?: string;
    category?: FileCategory | '';
    includeArchived?: boolean;
    page?: number;
    pageSize?: number;
};

export type FileListResponse = {
    items: FileMetadataDto[];
    page: number;
    pageSize: number;
    totalCount: number;
};
