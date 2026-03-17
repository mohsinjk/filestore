import { filesApi } from '../services/filesApi';
import type { FileMetadataDto, FileStatus } from '../types/file.types';
import { formatDate } from '@/shared/utils/formatters';
import { Download, FileText, FolderOpen } from 'lucide-react';

const STATUS_CONFIG: Record<FileStatus, { dot: string; badge: string; label: string }> = {
    Active: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200', label: 'Active' },
    Archived: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Archived' },
    Deleted: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'Deleted' },
};

const CATEGORY_COLORS: Record<string, string> = {
    Invoice: 'bg-blue-50 text-blue-700 border-blue-200',
    Contract: 'bg-violet-50 text-violet-700 border-violet-200',
    Statement: 'bg-teal-50 text-teal-700 border-teal-200',
    Receipt: 'bg-orange-50 text-orange-700 border-orange-200',
    Agreement: 'bg-rose-50 text-rose-700 border-rose-200',
};

const EXT_CONFIG: Record<string, { label: string; cls: string }> = {
    'application/pdf': { label: 'PDF', cls: 'bg-red-100 text-red-700' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', cls: 'bg-blue-100 text-blue-700' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', cls: 'bg-green-100 text-green-700' },
    'image/jpeg': { label: 'JPG', cls: 'bg-violet-100 text-violet-700' },
    'image/png': { label: 'PNG', cls: 'bg-violet-100 text-violet-700' },
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileTableProps {
    files: FileMetadataDto[];
}

export const FileTable = ({ files }: FileTableProps) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FolderOpen className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-sm font-medium">No files match your filters</p>
                <p className="text-xs">Try adjusting the search criteria above.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Case ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {files.map((file) => {
                        const ext = EXT_CONFIG[file.contentType];
                        const status = STATUS_CONFIG[file.status];
                        const catColor = CATEGORY_COLORS[file.category] ?? 'bg-slate-50 text-slate-700 border-slate-200';
                        return (
                            <tr key={file.id} className="hover:bg-blue-50/40 transition-colors group">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 truncate max-w-[180px]" title={file.fileName}>
                                                {file.fileName}
                                            </p>
                                            {ext && (
                                                <span className={`inline-block mt-0.5 px-1.5 py-0 rounded text-[10px] font-bold ${ext.cls}`}>
                                                    {ext.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
                                        {file.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{file.caseId}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{file.customerId}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{formatFileSize(file.fileSizeBytes)}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                    {formatDate(file.uploadedAt)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.badge}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={filesApi.getDownloadUrl(file.id)}
                                        download={file.fileName}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Download ${file.fileName}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-all duration-150 shadow-sm"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </a>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
