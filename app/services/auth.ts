import { supabase } from '@/lib/supabase';

const isClient = typeof window !== 'undefined';

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

export const register = async (userData: RegisterData) => {
  throw new Error("Registration is currently disabled. Please contact your administrator.");
};

export const login = async (credentials: LoginCredentials) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', credentials.username)
    .eq('password_hash', credentials.password)
    .single();

  if (error || !data) {
    throw new Error("Invalid username or password");
  }

  const user: User = {
    id: data.id,
    username: data.username,
    fullName: data.email,
    role: 'CASE_MANAGER',
  };

  if (isClient) {
    localStorage.setItem('token', `session-${data.id}`);
    localStorage.setItem('user', JSON.stringify(user));
  }

  return { token: `session-${data.id}`, user };
};

export const logout = () => {
  if (isClient) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isClient) return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (!isClient) return false;
  return !!localStorage.getItem('token');
};

export const getAuthHeader = () => {
  if (!isClient) return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
