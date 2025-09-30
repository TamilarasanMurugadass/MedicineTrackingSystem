import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import {
  InventoryTransactionDto,
  CreateInventoryTransactionDto,
  WithdrawMedicineRequest,
  AdjustStockRequest,
  MarkExpiredRequest,
  MarkDamagedRequest,
  ApiResponse
} from '../types';

export const useInventoryTransactions = () => {
  const [transactions, setTransactions] = useState<InventoryTransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (batchId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = batchId
        ? `${API_ENDPOINTS.INVENTORY_TRANSACTIONS}?batchId=${batchId}`
        : API_ENDPOINTS.INVENTORY_TRANSACTIONS;

      const response = await axios.get<ApiResponse<InventoryTransactionDto[]>>(url);
      if (response.data.success && response.data.data) {
        setTransactions(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateInventoryTransactionDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<InventoryTransactionDto>>(
        API_ENDPOINTS.INVENTORY_TRANSACTIONS,
        transactionData
      );
      if (response.data.success && response.data.data) {
        setTransactions(prev => [response.data.data!, ...prev]);
        return true;
      } else {
        setError(response.data.message || 'Failed to create transaction');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawMedicine = async (withdrawData: WithdrawMedicineRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<InventoryTransactionDto>>(
        API_ENDPOINTS.INVENTORY_WITHDRAW,
        withdrawData
      );
      if (response.data.success && response.data.data) {
        setTransactions(prev => [response.data.data!, ...prev]);
        return true;
      } else {
        setError(response.data.message || 'Failed to withdraw medicine');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to withdraw medicine');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adjustStock = async (adjustData: AdjustStockRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<InventoryTransactionDto>>(
        API_ENDPOINTS.INVENTORY_ADJUST,
        adjustData
      );
      if (response.data.success && response.data.data) {
        setTransactions(prev => [response.data.data!, ...prev]);
        return true;
      } else {
        setError(response.data.message || 'Failed to adjust stock');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markExpired = async (expiredData: MarkExpiredRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<InventoryTransactionDto>>(
        API_ENDPOINTS.INVENTORY_MARK_EXPIRED,
        expiredData
      );
      if (response.data.success && response.data.data) {
        setTransactions(prev => [response.data.data!, ...prev]);
        return true;
      } else {
        setError(response.data.message || 'Failed to mark as expired');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as expired');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markDamaged = async (damagedData: MarkDamagedRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<InventoryTransactionDto>>(
        API_ENDPOINTS.INVENTORY_MARK_DAMAGED,
        damagedData
      );
      if (response.data.success && response.data.data) {
        setTransactions(prev => [response.data.data!, ...prev]);
        return true;
      } else {
        setError(response.data.message || 'Failed to mark as damaged');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as damaged');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    withdrawMedicine,
    adjustStock,
    markExpired,
    markDamaged,
  };
};