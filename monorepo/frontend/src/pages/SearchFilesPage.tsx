import { FileList } from '@/features/files/components/FileList';
import { Search } from 'lucide-react';

export const SearchFilesPage = () => {
    return (
        <div className="space-y-8">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-600 p-8 text-white shadow-lg">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute right-20 bottom-0 h-36 w-36 rounded-full bg-purple-700/40" />
                <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-violet-400/20" />

                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                            <Search className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Search Files</h1>
                            <p className="mt-1 text-purple-100 text-sm">
                                Find and retrieve uploaded documents by case, customer, or category.
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-3">
                        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                            <Search className="h-4 w-4" />
                            Filter by case or customer
                        </div>
                    </div>
                </div>
            </div>

            <FileList />
        </div>
    );
};
