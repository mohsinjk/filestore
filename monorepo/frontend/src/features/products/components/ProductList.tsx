import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Plus } from 'lucide-react';

export const ProductList = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return <LoadingState message="Loading products..." />;
  }

  if (error) {
    return <ErrorMessage message={(error as Error).message} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">No products found</p>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="h-4 w-4" />
            Add First Product
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
