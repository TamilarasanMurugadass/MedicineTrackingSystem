import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { MedicineBatchDto, CreateMedicineBatchDto, UpdateMedicineBatchDto, ApiResponse } from '../types';

export const useMedicineBatches = () => {
  const [batches, setBatches] = useState<MedicineBatchDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBatches = useCallback(async (medicineId?: number) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const url = medicineId
        ? `${API_ENDPOINTS.MEDICINE_BATCHES}?medicineId=${medicineId}`
        : API_ENDPOINTS.MEDICINE_BATCHES;

      const response = await axios.get<ApiResponse<MedicineBatchDto[]>>(
        url,
        { signal: abortControllerRef.current.signal }
      );
      if (response.data.success && response.data.data) {
        setBatches(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch medicine batches');
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return; // Request was cancelled, don't set error
      }
      setError(err.response?.data?.message || 'Failed to fetch medicine batches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBatch = async (batchData: CreateMedicineBatchDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<MedicineBatchDto>>(
        API_ENDPOINTS.MEDICINE_BATCHES,
        batchData
      );
      if (response.data.success && response.data.data) {
        setBatches(prev => [...prev, response.data.data!]);
        return true;
      } else {
        setError(response.data.message || 'Failed to create medicine batch');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create medicine batch');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBatch = async (id: number, batchData: UpdateMedicineBatchDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put<ApiResponse<MedicineBatchDto>>(
        `${API_ENDPOINTS.MEDICINE_BATCHES}/${id}`,
        batchData
      );
      if (response.data.success && response.data.data) {
        setBatches(prev => prev.map(b => b.id === id ? response.data.data! : b));
        return true;
      } else {
        setError(response.data.message || 'Failed to update medicine batch');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update medicine batch');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBatch = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete<ApiResponse<any>>(`${API_ENDPOINTS.MEDICINE_BATCHES}/${id}`);
      if (response.data.success) {
        setBatches(prev => prev.filter(b => b.id !== id));
        return true;
      } else {
        setError(response.data.message || 'Failed to delete medicine batch');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete medicine batch');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return {
    batches,
    isLoading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
  };
};