export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const status = response.status;

  try {
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: data.message || 'An error occurred',
        status,
      };
    }

    return {
      data,
      status,
    };
  } catch (error) {
    return {
      error: 'Failed to parse response',
      status,
    };
  }
} 