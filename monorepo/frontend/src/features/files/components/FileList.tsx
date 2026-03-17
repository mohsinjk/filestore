import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFiles } from '../hooks/useFiles';
import { FileTable } from './FileTable';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { FILE_CATEGORIES } from '../utils/fileValidation';
import type { FileListRequest, FileCategory } from '../types/file.types';
import { Search, Files, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

type FilterState = {
    caseId: string;
    customerId: string;
    category: FileCategory | '';
    includeArchived: boolean;
};

const DEFAULT_FILTERS: FilterState = {
    caseId: '',
    customerId: '',
    category: '',
    includeArchived: false,
};

export const FileList = () => {
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [activeQuery, setActiveQuery] = useState<FileListRequest | null>(null);
    const [page, setPage] = useState(1);

    const queryEnabled =
        activeQuery !== null &&
        (!!activeQuery.caseId || !!activeQuery.customerId);

    const { data, isLoading, error } = useFiles(
        { ...activeQuery, page, pageSize: 20 } as FileListRequest,
        queryEnabled
    );

    const canSearch = filters.caseId.trim() !== '' || filters.customerId.trim() !== '';

    const handleSearch = () => {
        setPage(1);
        setActiveQuery({
            caseId: filters.caseId.trim() || undefined,
            customerId: filters.customerId.trim() || undefined,
            category: filters.category || undefined,
            includeArchived: filters.includeArchived || undefined,
        });
    };

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
        setActiveQuery(null);
        setPage(1);
    };

    const totalPages = data ? Math.ceil(data.totalCount / 20) : 0;

    return (
        <Card className="overflow-hidden shadow-md border-0">
            {/* Gradient header */}
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 py-5 px-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2.5 text-white text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                            <Files className="h-4 w-4" />
                        </div>
                        Uploaded Files
                    </CardTitle>
                    {activeQuery && data && (
                        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            {data.totalCount} result{data.totalCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Filter panel */}
                <div className="rounded-xl border bg-slate-50/60 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Filter Files
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-caseId" className="text-xs font-medium">Case ID</Label>
                            <Input
                                id="filter-caseId"
                                value={filters.caseId}
                                onChange={(e) => setFilters((f) => ({ ...f, caseId: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                                placeholder="e.g. CASE-101"
                                className="h-9 text-sm bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-customerId" className="text-xs font-medium">Customer ID</Label>
                            <Input
                                id="filter-customerId"
                                value={filters.customerId}
                                onChange={(e) => setFilters((f) => ({ ...f, customerId: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                                placeholder="e.g. CUST-001"
                                className="h-9 text-sm bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-category" className="text-xs font-medium">Category</Label>
                            <select
                                id="filter-category"
                                value={filters.category}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, category: e.target.value as FileCategory | '' }))
                                }
                                className="flex h-9 w-full rounded-md border border-input px-2 py-1 text-sm bg-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">All categories</option>
                                {FILE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col justify-end gap-2">
                            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={filters.includeArchived}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, includeArchived: e.target.checked }))
                                    }
                                    className="rounded accent-slate-700"
                                />
                                <span className="text-slate-600">Include archived</span>
                            </label>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleSearch}
                                    disabled={!canSearch}
                                    className="flex-1 h-9 bg-slate-800 hover:bg-slate-700 text-white shadow-sm"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    Search
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-9 bg-white hover:bg-slate-50"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {!queryEnabled && (
                    <div className="flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Search className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">Start searching for files</p>
                        <p className="text-xs text-center max-w-xs">
                            Enter a Case ID or Customer ID above and click <strong>Search</strong> to browse stored files.
                        </p>
                    </div>
                )}

                {queryEnabled && isLoading && <LoadingState message="Loading files..." />}
                {queryEnabled && error && <ErrorMessage message={(error as Error).message} />}

                {queryEnabled && !isLoading && !error && data && (
                    <>
                        <FileTable files={data.items} />

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-muted-foreground">
                                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                                    {' '}· {data.totalCount} total
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="h-8 px-3"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="h-8 px-3"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
