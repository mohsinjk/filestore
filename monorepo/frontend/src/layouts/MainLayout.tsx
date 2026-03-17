import { Link, Outlet } from 'react-router-dom';
import { Package } from 'lucide-react';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        <Link to="/products" className="text-xl font-bold">
                            Product Manager
                        </Link>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
