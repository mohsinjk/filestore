import { useQuery } from '@tanstack/react-query';
import { filesApi } from '../services/filesApi';
import type { FileListRequest } from '../types/file.types';

export const useFiles = (params: FileListRequest, enabled: boolean) => {
    return useQuery({
        queryKey: ['files', params],
        queryFn: () => filesApi.list(params),
        enabled,
    });
};
