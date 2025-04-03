'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '../services/auth';
import { User, LoginCredentials, RegisterData } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const router = useRouter();

  // Handle redirects via useEffect
  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
      setRedirectTo(null);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login(credentials);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        // Use state to trigger redirect instead of direct router call
        setRedirectTo('/app');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Only send expected fields to the API
      const registerData = {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        role: data.role || 'CASE_MANAGER'
      };
      
      await authService.register(registerData);
      
      // After registration, log the user in
      await login({ username: data.username, password: data.password });
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Parse and handle validation errors
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => 
          Object.values(e).join(': ')
        ).join(', ');
        setError(errorMessages || 'Registration failed');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would call an API to update the user profile
      // await authService.updateProfile(updatedUser);
      
      // For now, just update the local state
      setUser(updatedUser);
      
      // Update the user in localStorage to persist changes
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Use state to trigger redirect instead of direct router call
    setRedirectTo('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 