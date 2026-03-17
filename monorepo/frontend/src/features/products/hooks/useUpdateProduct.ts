import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/productsApi';
import type { UpdateProductDto } from '../types/product.types';

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
            productsApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific product and products list
            queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
