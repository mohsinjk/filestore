import { apiClient } from '@/shared/api/client';
import { API_CONFIG } from '@/shared/api/config';
import type {
    FileMetadataDto,
    FileListRequest,
    FileListResponse,
    UploadFileRequest,
} from '../types/file.types';

export const filesApi = {
    upload: async (data: UploadFileRequest): Promise<FileMetadataDto> => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('caseId', data.caseId);
        formData.append('customerId', data.customerId);
        formData.append('category', data.category);

        const response = await apiClient.post<FileMetadataDto>(
            API_CONFIG.ENDPOINTS.FILES,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    list: async (params: FileListRequest): Promise<FileListResponse> => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
        );
        const response = await apiClient.get<FileListResponse>(API_CONFIG.ENDPOINTS.FILES, {
            params: cleanParams,
        });
        return response.data;
    },

    getMetadata: async (id: string): Promise<FileMetadataDto> => {
        const response = await apiClient.get<FileMetadataDto>(
            `${API_CONFIG.ENDPOINTS.FILES}/${id}/metadata`
        );
        return response.data;
    },

    getDownloadUrl: (id: string): string => {
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES}/${id}/content`;
    },
};
