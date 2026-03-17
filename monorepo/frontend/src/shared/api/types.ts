// Common API types based on Swagger schema

export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null;
    detail?: string | null;
    instance?: string | null;
}

export interface ApiError {
    message: string;
    status?: number;
    details?: ProblemDetails;
}
