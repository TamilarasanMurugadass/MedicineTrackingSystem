import { useState, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { UserDto, UpdateUserDto, ChangePasswordDto, CreateUserDto } from '../types';

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getUserById = useCallback(async (id: string): Promise<UserDto | null> => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ success: boolean; data: UserDto; message: string }>(
        API_ENDPOINTS.USER_BY_ID(id),
        { signal: abortControllerRef.current.signal }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        setError(response.data.message || 'Failed to fetch user');
        return null;
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return null; // Request was cancelled, don't set error
      }
      setError(err.response?.data?.message || 'Failed to fetch user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: UpdateUserDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.put(API_ENDPOINTS.UPDATE_USER(id), userData);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (id: string, passwordData: ChangePasswordDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(API_ENDPOINTS.CHANGE_PASSWORD(id), passwordData);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllUsers = useCallback(async (): Promise<UserDto[]> => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ success: boolean; data: UserDto[]; message: string }>(
        API_ENDPOINTS.USERS,
        { signal: abortControllerRef.current.signal }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        setError(response.data.message || 'Failed to fetch users');
        return [];
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return []; // Request was cancelled, don't set error
      }
      setError(err.response?.data?.message || 'Failed to fetch users');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActiveUsers = useCallback(async (): Promise<UserDto[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ success: boolean; data: UserDto[]; message: string }>(API_ENDPOINTS.USERS_ACTIVE);
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        setError(response.data.message || 'Failed to fetch active users');
        return [];
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch active users');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserDto): Promise<UserDto | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deactivateUser = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(API_ENDPOINTS.DEACTIVATE_USER(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateUser = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(API_ENDPOINTS.ACTIVATE_USER(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getUserById,
    updateUser,
    changePassword,
    getAllUsers,
    getActiveUsers,
    createUser,
    deactivateUser,
    activateUser,
  };
};