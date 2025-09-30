import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDto, LoginDto, LoginResponseDto, ApiResponse } from '../types';
import axios from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<ApiResponse<LoginResponseDto>>;
  logout: () => void;
  updateUser: (user: UserDto) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginDto): Promise<ApiResponse<LoginResponseDto>> => {
    try {
      const response = await axios.post<LoginResponseDto>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return {
          success: true,
          data: response.data,
          message: 'Login successful'
        };
      }

      return {
        success: false,
        message: 'Invalid response from server'
      };
    } catch (error: any) {
      const errorResponse: ApiResponse<LoginResponseDto> = {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
      return errorResponse;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser: UserDto) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};