import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to check if code is running on the client side
const isClient = typeof window !== 'undefined';

// Type definitions
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName?: string;
  role?: string;
}

export interface User {
  id: string;
  username: string;
  fullName?: string;
  role: string;
}

// Register a new user
export const register = async (userData: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    // Rethrow for handling in components
    throw error;
  }
};

// Login a user
export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  if (response.data.token && isClient) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Logout a user
export const logout = () => {
  if (isClient) {
    localStorage.removeItem('token');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  if (!isClient) {
    return null;
  }
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    localStorage.removeItem('token');
    return null;
  }
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  if (!isClient) {
    return false;
  }
  return !!localStorage.getItem('token');
};

// Get auth header
export const getAuthHeader = () => {
  if (!isClient) {
    return {};
  }
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 