// Product types based on Swagger schema

export type ProductDto = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    createdAt: string;
};

export type CreateProductDto = {
    name: string;
    description?: string | null;
    price: number;
    initialStock: number;
};

export type UpdateProductDto = {
    name: string;
    description?: string | null;
    price: number;
};
