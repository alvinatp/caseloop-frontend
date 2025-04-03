import { API_BASE_URL, getHeaders, handleApiResponse, ApiResponse } from './config';

export type User = {
  id: number;
  username: string;
  role: 'CASE_MANAGER' | 'ADMIN';
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user?: User;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = LoginCredentials & {
  role?: 'CASE_MANAGER' | 'ADMIN';
};

export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });

  return handleApiResponse<AuthResponse>(response);
}

export async function register(data: RegisterData): Promise<ApiResponse<{ message: string; user: User }>> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse<{ message: string; user: User }>(response);
}

export async function getCurrentUser(token: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
  });

  return handleApiResponse<User>(response);
} 