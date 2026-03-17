import { z } from 'zod';

export const FILE_CATEGORIES = [
    'Invoice',
    'Contract',
    'Statement',
    'Receipt',
    'Agreement',
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
];

export const uploadFileSchema = z.object({
    caseId: z.string().min(1, 'Case ID is required'),
    customerId: z.string().min(1, 'Customer ID is required'),
    category: z.enum(FILE_CATEGORIES, { error: 'Please select a category' }),
});

export type UploadFileFormData = z.infer<typeof uploadFileSchema>;
