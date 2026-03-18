import { Link, Outlet, NavLink } from 'react-router-dom';
import { FolderOpen, Search } from 'lucide-react';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-6 w-6" />
                            <Link to="/files" className="text-xl font-bold">
                                File Storage
                            </Link>
                        </div>
                        <nav className="flex items-center gap-1">
                            <NavLink
                                to="/files"
                                end
                                className={({ isActive }) =>
                                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`
                                }
                            >
                                <FolderOpen className="h-4 w-4" />
                                Upload Files
                            </NavLink>
                            <NavLink
                                to="/files/search"
                                className={({ isActive }) =>
                                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`
                                }
                            >
                                <Search className="h-4 w-4" />
                                Search Files
                            </NavLink>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
