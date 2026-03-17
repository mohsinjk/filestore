import { z } from 'zod';

// Validation schema for creating a product
export const createProductSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must not exceed 100 characters'),
    description: z
        .string()
        .max(500, 'Description must not exceed 500 characters')
        .nullable()
        .optional(),
    price: z
        .number()
        .min(10, 'Price must be at least $10')
        .positive('Price must be positive'),
    initialStock: z
        .number()
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative')
        .max(2147483647, 'Stock value too large'),
});

// Validation schema for updating a product
export const updateProductSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must not exceed 100 characters'),
    description: z
        .string()
        .max(500, 'Description must not exceed 500 characters')
        .nullable()
        .optional(),
    price: z
        .number()
        .min(10, 'Price must be at least $10')
        .positive('Price must be positive'),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
