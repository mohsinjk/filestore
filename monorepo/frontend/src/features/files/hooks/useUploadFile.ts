import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../services/filesApi';
import type { UploadFileRequest } from '../types/file.types';

export const useUploadFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UploadFileRequest) => filesApi.upload(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        },
    });
};
