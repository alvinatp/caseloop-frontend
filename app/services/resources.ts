import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Type definitions
export interface Resource {
  id: number;
  name: string;
  category: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  contactDetails: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    services?: string[];
    eligibility?: string[];
    hours?: Array<{ day: string; hours: string }>;
  };
  zipcode: string;
  notes: Array<{
    userId: number;
    username: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  lastUpdated: string;
}

export interface ResourceUpdateData {
  status?: Resource['status'];
  contactDetails?: Resource['contactDetails'];
  suggest_removal?: boolean;
}

export interface ResourceNoteData {
  content: string;
}

// Get all resources with optional filters
export const getResources = async (params?: { page?: number; category?: string; zipcode?: string }) => {
  try {
    const response = await axios.get<{
      currentPage: number;
      totalPages: number;
      totalResources: number;
      resources: Resource[];
    }>(`${API_URL}/resources`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Get a single resource by ID
export const getResourceById = async (id: string | number): Promise<Resource> => {
  try {
    const response = await axios.get<Resource>(`${API_URL}/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resource with ID ${id}:`, error);
    throw error;
  }
};

// Update a resource's details (requires authentication)
export const updateResourceDetails = async (id: string | number, updateData: ResourceUpdateData) => {
  try {
    const response = await axios.put(`${API_URL}/resources/${id}`, updateData, {
      headers: { ...getAuthHeader() },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating resource with ID ${id}:`, error);
    throw error;
  }
};

// Add a note to a resource (requires authentication)
export const addResourceNote = async (id: string | number, noteData: ResourceNoteData) => {
  try {
    const response = await axios.post(`${API_URL}/resources/${id}/notes`, { notes: noteData.content }, {
      headers: { ...getAuthHeader() },
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding note to resource with ID ${id}:`, error);
    throw error;
  }
};

// Search resources
export const searchResources = async (query: string, params?: { page?: number; category?: string; zipcode?: string }) => {
  try {
    const response = await axios.get<{
      currentPage: number;
      totalPages: number;
      totalResources: number;
      resources: Resource[];
    }>(`${API_URL}/resources/search`, {
      params: { query, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching resources:', error);
    throw error;
  }
};

// Get recent updates
export const getRecentUpdates = async (since?: string): Promise<Resource[]> => {
  try {
    const response = await axios.get<Resource[]>(`${API_URL}/resources/updates`, {
      params: { since },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent updates:', error);
    throw error;
  }
};

// Save a resource
export const saveResource = async (id: string | number) => {
  try {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    const response = await axios.post(`${API_URL}/resources/${numericId}/save`, {}, {
      headers: { ...getAuthHeader() }
    });
    return response.data;
  } catch (error) {
    console.error(`Error saving resource with ID ${id}:`, error);
    throw error;
  }
};

// Unsave a resource
export const unsaveResource = async (id: string | number) => {
  try {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    const response = await axios.delete(`${API_URL}/resources/${numericId}/save`, {
      headers: { ...getAuthHeader() }
    });
    return response.data;
  } catch (error) {
    console.error(`Error unsaving resource with ID ${id}:`, error);
    throw error;
  }
};

// Get user's saved resources
export const getSavedResources = async (): Promise<Resource[]> => {
  try {
    const response = await axios.get<Resource[]>(`${API_URL}/resources/saved`, {
      headers: { ...getAuthHeader() }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching saved resources:', error);
    throw error;
  }
};

// Create a new resource
export const createResource = async (data: {
  name: string;
  category: string;
  status: Resource['status'];
  contactDetails: Resource['contactDetails'];
  zipcode: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/resources/create`, data, {
      headers: { ...getAuthHeader() }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

// Create resources from HTML content
export const createResourcesFromHtml = async (html: string, defaultCategory?: string) => {
  try {
    const response = await axios.post(`${API_URL}/resources/import`, { html, defaultCategory }, {
      headers: { ...getAuthHeader() }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating resources from HTML:', error);
    throw error;
  }
}; 