import { useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface ApiResponse<T> {
  data: T;
  loading: boolean;
  error: ApiError | null;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestFn();
      return response.data;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.message || err.message || 'An error occurred',
        status: err.response?.status,
        data: err.response?.data,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(
    <T>(url: string) => handleRequest<T>(() => apiClient.get<T>(url)),
    [handleRequest]
  );

  const post = useCallback(
    <T>(url: string, data?: any) => handleRequest<T>(() => apiClient.post<T>(url, data)),
    [handleRequest]
  );

  const put = useCallback(
    <T>(url: string, data?: any) => handleRequest<T>(() => apiClient.put<T>(url, data)),
    [handleRequest]
  );

  const patch = useCallback(
    <T>(url: string, data?: any) => handleRequest<T>(() => apiClient.patch<T>(url, data)),
    [handleRequest]
  );

  const del = useCallback(
    <T>(url: string) => handleRequest<T>(() => apiClient.delete<T>(url)),
    [handleRequest]
  );

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    loading,
    error,
    clearError: () => setError(null),
  };
}

export default useApi;