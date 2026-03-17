import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadFile } from '../hooks/useUploadFile';
import {
    uploadFileSchema,
    FILE_CATEGORIES,
    MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES,
} from '../utils/fileValidation';
import type { UploadFileFormData } from '../utils/fileValidation';
import type { FileCategory } from '../types/file.types';
import { Loader2, UploadCloud, CheckCircle, X, FileText, AlertCircle } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
    Invoice: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100',
    Contract: 'bg-violet-50 text-violet-700 border-violet-300 hover:bg-violet-100',
    Statement: 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100',
    Receipt: 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100',
    Agreement: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100',
};

const CATEGORY_COLORS_ACTIVE: Record<string, string> = {
    Invoice: 'bg-blue-600 text-white border-blue-600 shadow-sm',
    Contract: 'bg-violet-600 text-white border-violet-600 shadow-sm',
    Statement: 'bg-teal-600 text-white border-teal-600 shadow-sm',
    Receipt: 'bg-orange-500 text-white border-orange-500 shadow-sm',
    Agreement: 'bg-rose-600 text-white border-rose-600 shadow-sm',
};

const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileUploadForm = () => {
    const uploadMutation = useUploadFile();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UploadFileFormData>({
        resolver: zodResolver(uploadFileSchema),
    });

    const selectedCategory = watch('category');
    // register category field without rendering an input
    register('category');

    const validateAndSetFile = (file: File) => {
        setFileError(null);
        if (file.size > MAX_FILE_SIZE) {
            setFileError('File exceeds the 50 MB size limit.');
            return;
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setFileError('File type not allowed. Accepted: PDF, DOCX, XLSX, JPEG, PNG.');
            return;
        }
        setSelectedFile(file);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) { setSelectedFile(null); return; }
        validateAndSetFile(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onSubmit = (data: UploadFileFormData) => {
        if (!selectedFile) {
            setFileError('Please select a file to upload.');
            return;
        }
        uploadMutation.mutate(
            { file: selectedFile, ...data, category: data.category as FileCategory },
            {
                onSuccess: () => {
                    reset();
                    clearFile();
                },
            }
        );
    };

    return (
        <Card className="overflow-hidden shadow-md border-0">
            {/* Gradient header */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 py-5 px-6">
                <CardTitle className="flex items-center gap-2.5 text-white text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                        <UploadCloud className="h-4 w-4" />
                    </div>
                    Upload a New File
                    <span className="ml-auto text-xs font-normal text-blue-200">PDF, DOCX, XLSX, JPEG, PNG · max 50 MB</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
                {uploadMutation.isSuccess && (
                    <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-green-50 border border-green-200 text-green-800 shadow-sm">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Upload successful!</p>
                            <p className="text-xs text-green-600">Your file has been stored and is now active.</p>
                        </div>
                    </div>
                )}
                {uploadMutation.isError && (
                    <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 shadow-sm">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Upload failed</p>
                            <p className="text-xs text-red-600">{(uploadMutation.error as Error)?.message ?? 'An unexpected error occurred.'}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Row 1: Case ID + Customer ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="caseId" className="text-sm font-medium">
                                Case ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="caseId"
                                {...register('caseId')}
                                placeholder="e.g. CASE-101"
                                className={`h-10 ${errors.caseId ? 'border-destructive focus-visible:ring-destructive/30' : 'focus-visible:ring-blue-500/30'}`}
                            />
                            {errors.caseId && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />{errors.caseId.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerId" className="text-sm font-medium">
                                Customer ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="customerId"
                                {...register('customerId')}
                                placeholder="e.g. CUST-001"
                                className={`h-10 ${errors.customerId ? 'border-destructive focus-visible:ring-destructive/30' : 'focus-visible:ring-blue-500/30'}`}
                            />
                            {errors.customerId && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />{errors.customerId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Category pill selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Category <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {FILE_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setValue('category', cat, { shouldValidate: true })}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${selectedCategory === cat
                                            ? CATEGORY_COLORS_ACTIVE[cat]
                                            : CATEGORY_COLORS[cat]
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {errors.category && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{errors.category.message}
                            </p>
                        )}
                    </div>

                    {/* Drag-and-drop zone */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            File <span className="text-destructive">*</span>
                        </Label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !selectedFile && fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 ${isDragging
                                    ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-md'
                                    : selectedFile
                                        ? 'border-green-400 bg-green-50 cursor-default'
                                        : fileError
                                            ? 'border-destructive bg-destructive/5 cursor-pointer'
                                            : 'border-input bg-muted/30 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer'
                                } p-8`}
                        >
                            {selectedFile ? (
                                <>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <FileText className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-green-800">{selectedFile.name}</p>
                                        <p className="text-xs text-green-600 mt-0.5">{formatBytes(selectedFile.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                        className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-green-700 transition-colors"
                                        aria-label="Remove file"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isDragging ? 'bg-blue-100' : 'bg-muted'
                                        }`}>
                                        <UploadCloud className={`h-6 w-6 transition-colors ${isDragging ? 'text-blue-600' : 'text-muted-foreground'
                                            }`} />
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-blue-700' : 'text-foreground'
                                            }`}>
                                            {isDragging ? 'Drop your file here' : 'Drag & drop or click to browse'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, XLSX, JPEG, PNG up to 50 MB</p>
                                    </div>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                id="file"
                                type="file"
                                accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        {fileError && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{fileError}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end pt-1">
                        <Button
                            type="submit"
                            disabled={uploadMutation.isPending}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm px-6"
                        >
                            {uploadMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-4 w-4" />
                                    Upload File
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
