import { useParams } from 'react-router-dom';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProduct } from '@/features/products/hooks/useProduct';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';

export const ProductEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const { data: product, isLoading, error } = useProduct(id!);

    if (isLoading) {
        return <LoadingState message="Loading product..." />;
    }

    if (error) {
        return <ErrorMessage message={(error as Error).message} />;
    }

    if (!product) {
        return <ErrorMessage message="Product not found" />;
    }

    return <ProductForm mode="edit" product={product} />;
};
