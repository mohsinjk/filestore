import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/productsApi';

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productsApi.delete(id),
        onSuccess: () => {
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
