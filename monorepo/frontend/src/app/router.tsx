import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ProductCreatePage } from '@/pages/ProductCreatePage';
import { ProductEditPage } from '@/pages/ProductEditPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/products" replace />,
            },
            {
                path: 'products',
                children: [
                    {
                        index: true,
                        element: <ProductsPage />,
                    },
                    {
                        path: 'new',
                        element: <ProductCreatePage />,
                    },
                    {
                        path: ':id',
                        element: <ProductDetailPage />,
                    },
                    {
                        path: ':id/edit',
                        element: <ProductEditPage />,
                    },
                ],
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);
