import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/productsApi';
import type { CreateProductDto } from '../types/product.types';

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductDto) => productsApi.create(data),
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
