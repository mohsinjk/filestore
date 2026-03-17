import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import {
    createProductSchema,
    updateProductSchema,
} from '../utils/productValidation';
import type { CreateProductFormData, UpdateProductFormData } from '../utils/productValidation';
import type { ProductDto } from '../types/product.types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

interface ProductFormProps {
    product?: ProductDto;
    mode: 'create' | 'edit';
}

export const ProductForm = ({ product, mode }: ProductFormProps) => {
    const navigate = useNavigate();
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    const isEdit = mode === 'edit';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateProductFormData | UpdateProductFormData>({
        resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema),
        defaultValues: isEdit && product
            ? {
                name: product.name,
                description: product.description || '',
                price: product.price,
            }
            : {
                name: '',
                description: '',
                price: 10,
                initialStock: 0,
            },
    });

    const mutation = isEdit ? updateMutation : createMutation;

    useEffect(() => {
        if (mutation.isSuccess) {
            navigate('/products');
        }
    }, [mutation.isSuccess, navigate]);

    const onSubmit = (data: CreateProductFormData | UpdateProductFormData) => {
        if (isEdit && product) {
            updateMutation.mutate({
                id: product.id,
                data: data as UpdateProductFormData,
            });
        } else {
            createMutation.mutate(data as CreateProductFormData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">
                    {isEdit ? 'Edit Product' : 'Create Product'}
                </h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? 'Update Product Details' : 'New Product'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Product Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="Enter product name"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Enter product description"
                                rows={4}
                                className={errors.description ? 'border-destructive' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Price ($) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className={errors.price ? 'border-destructive' : ''}
                                />
                                {errors.price && (
                                    <p className="text-sm text-destructive">{errors.price.message}</p>
                                )}
                            </div>

                            {!isEdit && (
                                <div className="space-y-2">
                                    <Label htmlFor="initialStock">
                                        Initial Stock <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="initialStock"
                                        type="number"
                                        {...register('initialStock', { valueAsNumber: true })}
                                        placeholder="0"
                                        className={('initialStock' in errors && errors.initialStock) ? 'border-destructive' : ''}
                                    />
                                    {('initialStock' in errors && errors.initialStock) && (
                                        <p className="text-sm text-destructive">{errors.initialStock.message}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {mutation.error && (
                            <div className="p-3 border border-destructive/50 bg-destructive/10 rounded-md">
                                <p className="text-sm text-destructive">
                                    {(mutation.error as Error).message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isEdit ? 'Update Product' : 'Create Product'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/products')}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
