import { apiClient } from '@/shared/api/client';
import { API_CONFIG } from '@/shared/api/config';
import type { ProductDto, CreateProductDto, UpdateProductDto } from '../types/product.types';

export const productsApi = {
    // Get all products
    getAll: async (): Promise<ProductDto[]> => {
        const response = await apiClient.get<ProductDto[]>(API_CONFIG.ENDPOINTS.PRODUCTS);
        return response.data;
    },

    // Get product by ID
    getById: async (id: string): Promise<ProductDto> => {
        const response = await apiClient.get<ProductDto>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
        return response.data;
    },

    // Create new product
    create: async (data: CreateProductDto): Promise<ProductDto> => {
        const response = await apiClient.post<ProductDto>(API_CONFIG.ENDPOINTS.PRODUCTS, data);
        return response.data;
    },

    // Update existing product
    update: async (id: string, data: UpdateProductDto): Promise<ProductDto> => {
        const response = await apiClient.put<ProductDto>(
            `${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`,
            data
        );
        return response.data;
    },

    // Delete product
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
    },
};
