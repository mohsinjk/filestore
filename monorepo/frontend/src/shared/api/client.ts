import axios, { AxiosError } from 'axios';
import { API_CONFIG } from './config';
import type { ApiError, ProblemDetails } from './types';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    const apiError: ApiError = {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data,
    };

    // Custom error messages based on status code
    if (error.response?.status === 404) {
      apiError.message = 'Resource not found';
    } else if (error.response?.status === 400) {
      apiError.message = error.response.data?.detail || 'Invalid request';
    } else if (error.response?.status && error.response.status >= 500) {
      apiError.message = 'Server error. Please try again later.';
    }

    return Promise.reject(apiError);
  }
);
