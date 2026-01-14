import { supabase } from '@/lib/supabase';

export interface Resource {
  id: number;
  organization: string;
  program?: string;
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
    userId: string;
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

const mapDbToResource = (row: any, notes: any[] = []): Resource => ({
  id: row.id,
  organization: row.organization,
  program: row.program,
  category: row.category,
  status: row.status,
  contactDetails: row.contact_details || {},
  zipcode: row.zipcode || '',
  notes: notes.map(n => ({
    userId: n.user_id,
    username: n.username,
    content: n.content,
    timestamp: n.created_at,
  })),
  createdAt: row.created_at,
  lastUpdated: row.last_updated,
});

export const getResources = async (params?: { page?: number; category?: string; zipcode?: string }) => {
  const page = params?.page || 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  let query = supabase.from('resources').select('*', { count: 'exact' });

  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.zipcode) {
    query = query.eq('zipcode', params.zipcode);
  }

  const { data, error, count } = await query
    .order('last_updated', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const totalResources = count || 0;
  const totalPages = Math.ceil(totalResources / limit);

  return {
    currentPage: page,
    totalPages,
    totalResources,
    resources: (data || []).map(r => mapDbToResource(r)),
  };
};

export const getResourceById = async (id: string | number): Promise<Resource> => {
  const { data: resource, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: notes } = await supabase
    .from('resource_notes')
    .select('*')
    .eq('resource_id', id)
    .order('created_at', { ascending: false });

  return mapDbToResource(resource, notes || []);
};

export const updateResourceDetails = async (id: string | number, updateData: ResourceUpdateData) => {
  const updates: any = { last_updated: new Date().toISOString() };

  if (updateData.status) updates.status = updateData.status;
  if (updateData.contactDetails) updates.contact_details = updateData.contactDetails;

  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbToResource(data);
};

export const addResourceNote = async (id: string | number, noteData: ResourceNoteData) => {
  const { data, error } = await supabase
    .from('resource_notes')
    .insert({
      resource_id: id,
      user_id: null,
      username: 'Anonymous',
      content: noteData.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const searchResources = async (query: string, params?: { page?: number; category?: string; zipcode?: string }) => {
  const page = params?.page || 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('resources')
    .select('*', { count: 'exact' })
    .or(`organization.ilike.%${query}%,program.ilike.%${query}%,category.ilike.%${query}%`);

  if (params?.category) {
    dbQuery = dbQuery.eq('category', params.category);
  }
  if (params?.zipcode) {
    dbQuery = dbQuery.eq('zipcode', params.zipcode);
  }

  const { data, error, count } = await dbQuery
    .order('last_updated', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const totalResources = count || 0;
  const totalPages = Math.ceil(totalResources / limit);

  return {
    currentPage: page,
    totalPages,
    totalResources,
    resources: (data || []).map(r => mapDbToResource(r)),
  };
};

export const getRecentUpdates = async (since: string, page: number = 1, limit: number = 15) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('resources')
    .select('*', { count: 'exact' })
    .gte('last_updated', since)
    .order('last_updated', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const totalResources = count || 0;
  const totalPages = Math.ceil(totalResources / limit);

  return {
    resources: (data || []).map(r => mapDbToResource(r)),
    currentPage: page,
    totalPages,
    totalResources,
  };
};

export const saveResource = async (id: string | number) => {
  const { error } = await supabase
    .from('saved_resources')
    .insert({ resource_id: id, user_id: null });

  if (error && error.code !== '23505') throw error;
  return { success: true };
};

export const unsaveResource = async (id: string | number) => {
  const { error } = await supabase
    .from('saved_resources')
    .delete()
    .eq('resource_id', id);

  if (error) throw error;
  return { success: true };
};

export const getSavedResources = async (): Promise<Resource[]> => {
  const { data: saved, error } = await supabase
    .from('saved_resources')
    .select('resource_id');

  if (error) throw error;
  if (!saved || saved.length === 0) return [];

  const resourceIds = saved.map(s => s.resource_id);
  const { data: resources, error: resourceError } = await supabase
    .from('resources')
    .select('*')
    .in('id', resourceIds);

  if (resourceError) throw resourceError;
  return (resources || []).map(r => mapDbToResource(r));
};

export const createResource = async (data: {
  organization: string;
  program?: string;
  category: string;
  status: Resource['status'];
  contactDetails: Resource['contactDetails'];
  zipcode: string;
}) => {
  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      organization: data.organization,
      program: data.program,
      category: data.category,
      status: data.status,
      contact_details: data.contactDetails,
      zipcode: data.zipcode,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbToResource(resource);
};

export const createResourcesFromHtml = async (html: string, defaultCategory?: string) => {
  console.log('HTML import not supported in demo mode');
  return { success: false, message: 'HTML import not supported in demo mode' };
};
