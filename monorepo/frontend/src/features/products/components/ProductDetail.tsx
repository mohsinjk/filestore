import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { ProductDeleteDialog } from './ProductDeleteDialog';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: product, isLoading, error } = useProduct(id!);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    if (isLoading) {
        return <LoadingState message="Loading product details..." />;
    }

    if (error) {
        return <ErrorMessage message={(error as Error).message} />;
    }

    if (!product) {
        return <ErrorMessage message="Product not found" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Product Details</h2>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-3xl">{product.name}</CardTitle>
                        {product.isActive ? (
                            <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                            <Badge variant="secondary">Inactive</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                        <p className="text-base">{product.description || 'No description available'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Price</h3>
                            <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Stock Quantity</h3>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                <p className="text-2xl font-semibold">{product.stockQuantity}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                            <p className="text-base">{formatDate(product.createdAt)}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                            Edit Product
                        </Button>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ProductDeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                productId={product.id}
                productName={product.name}
            />
        </div>
    );
};
