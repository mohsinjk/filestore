// Public exports from the products feature
export { ProductList } from './components/ProductList';
export { ProductCard } from './components/ProductCard';
export { ProductDetail } from './components/ProductDetail';
export { ProductForm } from './components/ProductForm';
export { ProductDeleteDialog } from './components/ProductDeleteDialog';

export { useProducts } from './hooks/useProducts';
export { useProduct } from './hooks/useProduct';
export { useCreateProduct } from './hooks/useCreateProduct';
export { useUpdateProduct } from './hooks/useUpdateProduct';
export { useDeleteProduct } from './hooks/useDeleteProduct';

export type { ProductDto, CreateProductDto, UpdateProductDto } from './types/product.types';
