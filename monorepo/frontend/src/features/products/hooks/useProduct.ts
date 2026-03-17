import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../services/productsApi';

export const useProduct = (id: string) => {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => productsApi.getById(id),
        enabled: !!id,
    });
};
