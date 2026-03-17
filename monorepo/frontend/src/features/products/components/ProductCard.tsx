import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProductDto } from '../types/product.types';
import { formatCurrency } from '@/shared/utils/formatters';
import { Package, Edit, Eye } from 'lucide-react';

interface ProductCardProps {
    product: ProductDto;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    {product.isActive ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.description || 'No description available'}
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stock</span>
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">{product.stockQuantity}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/products/${product.id}`}>
                        <Eye className="h-4 w-4" />
                        View
                    </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="flex-1">
                    <Link to={`/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
