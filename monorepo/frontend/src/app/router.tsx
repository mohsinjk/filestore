import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { FilesPage } from '@/pages/FilesPage';
import { SearchFilesPage } from '@/pages/SearchFilesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/files" replace />,
            },
            {
                path: 'files',
                element: <FilesPage />,
            },
            {
                path: 'files/search',
                element: <SearchFilesPage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);
