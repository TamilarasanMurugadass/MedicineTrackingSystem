import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { MedicineDto, CreateMedicineDto, UpdateMedicineDto, ApiResponse } from '../types';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<MedicineDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMedicines = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiResponse<MedicineDto[]>>(
        API_ENDPOINTS.MEDICINES,
        { signal: abortControllerRef.current.signal }
      );
      if (response.data.success && response.data.data) {
        setMedicines(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch medicines');
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return; // Request was cancelled, don't set error
      }
      setError(err.response?.data?.message || 'Failed to fetch medicines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMedicine = async (medicineData: CreateMedicineDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<MedicineDto>>(
        API_ENDPOINTS.MEDICINES,
        medicineData
      );
      if (response.data.success && response.data.data) {
        setMedicines(prev => [...prev, response.data.data!]);
        return true;
      } else {
        setError(response.data.message || 'Failed to create medicine');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create medicine');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMedicine = async (id: number, medicineData: UpdateMedicineDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put<ApiResponse<MedicineDto>>(
        `${API_ENDPOINTS.MEDICINES}/${id}`,
        medicineData
      );
      if (response.data.success && response.data.data) {
        setMedicines(prev => prev.map(m => m.id === id ? response.data.data! : m));
        return true;
      } else {
        setError(response.data.message || 'Failed to update medicine');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update medicine');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedicine = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete<ApiResponse<any>>(`${API_ENDPOINTS.MEDICINES}/${id}`);
      if (response.data.success) {
        setMedicines(prev => prev.filter(m => m.id !== id));
        return true;
      } else {
        setError(response.data.message || 'Failed to delete medicine');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete medicine');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const searchMedicines = useCallback(async (searchTerm: string) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiResponse<MedicineDto[]>>(
        `${API_ENDPOINTS.MEDICINES_SEARCH}?search=${encodeURIComponent(searchTerm)}`,
        { signal: abortControllerRef.current.signal }
      );
      if (response.data.success && response.data.data) {
        setMedicines(response.data.data);
      } else {
        setError(response.data.message || 'Failed to search medicines');
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return; // Request was cancelled, don't set error
      }
      setError(err.response?.data?.message || 'Failed to search medicines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  return {
    medicines,
    isLoading,
    error,
    fetchMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
  };
};