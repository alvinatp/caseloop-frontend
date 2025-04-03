import { API_BASE_URL, getHeaders, handleApiResponse, ApiResponse } from './config';

export type Resource = {
  id: number;
  name: string;
  category: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  contactDetails: {
    address?: string;
    phone?: string;
    email?: string;
  };
  zipcode: string;
  notes: Array<{
    userId: number;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  lastUpdated: string;
};

export type ResourcesResponse = {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  resources: Resource[];
};

export type ResourceFilters = {
  category?: string;
  status?: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  zipcode?: string;
  sort?: 'lastUpdated' | 'name';
  page?: number;
  limit?: number;
};

export async function getResources(filters: ResourceFilters = {}): Promise<ApiResponse<ResourcesResponse>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });

  const response = await fetch(`${API_BASE_URL}/resources?${params.toString()}`, {
    headers: getHeaders(),
  });

  return handleApiResponse<ResourcesResponse>(response);
}

export async function getResourceById(id: number): Promise<ApiResponse<Resource>> {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
    headers: getHeaders(),
  });

  return handleApiResponse<Resource>(response);
}

export type ResourceUpdate = {
  status?: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  notes?: string;
  suggest_removal?: boolean;
};

export async function updateResource(
  id: number,
  data: ResourceUpdate,
  token: string
): Promise<ApiResponse<{ message: string; resource: Resource }>> {
  const response = await fetch(`${API_BASE_URL}/resources/${id}/update`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleApiResponse<{ message: string; resource: Resource }>(response);
}

export async function searchResources(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<ResourcesResponse>> {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/resources/search?${params.toString()}`, {
    headers: getHeaders(),
  });

  return handleApiResponse<ResourcesResponse>(response);
}

export async function getRecentUpdates(since: string): Promise<ApiResponse<Resource[]>> {
  const params = new URLSearchParams({ since });

  const response = await fetch(`${API_BASE_URL}/resources/updates?${params.toString()}`, {
    headers: getHeaders(),
  });

  return handleApiResponse<Resource[]>(response);
} 