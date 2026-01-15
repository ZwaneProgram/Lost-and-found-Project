import { createClient } from '@supabase/supabase-js';
import { LostFoundItem } from '../types';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table name
const TABLE_NAME = 'lost_found_items';

/**
 * Convert Supabase row to LostFoundItem
 */
function rowToItem(row: any): LostFoundItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    location: row.location,
    contactInfo: row.contact_info,
    imageUrl: row.image_url || undefined,
    status: row.status || 'active',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert LostFoundItem to Supabase row
 */
function itemToRow(item: Partial<LostFoundItem>): any {
  return {
    type: item.type,
    title: item.title,
    description: item.description,
    location: item.location,
    contact_info: item.contactInfo,
    image_url: item.imageUrl || null,
    status: item.status || 'active',
  };
}

/**
 * Get all Lost & Found items from Supabase
 */
export async function getLostFoundItems(): Promise<LostFoundItem[]> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, falling back to empty array');
      return [];
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }

    return (data || []).map(rowToItem);
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
}

/**
 * Subscribe to Lost & Found items with real-time updates
 */
export function subscribeToLostFoundItems(
  callback: (items: LostFoundItem[]) => void
): () => void {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, using polling fallback');
    // Fallback to polling if Supabase not configured
    getLostFoundItems().then(callback);
    const intervalId = setInterval(() => {
      getLostFoundItems().then(callback);
    }, 2000);
    return () => clearInterval(intervalId);
  }

  // Initial load
  getLostFoundItems().then(callback);

  // Set up real-time subscription
  const channel = supabase
    .channel('lost-found-items-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
      },
      (payload) => {
        console.log('Real-time update received:', payload.eventType);
        // Reload items when changes occur
        getLostFoundItems().then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get Lost & Found items filtered by type
 */
export async function getLostFoundItemsByType(
  type: 'lost' | 'found'
): Promise<LostFoundItem[]> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return [];
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items by type:', error);
      return [];
    }

    return (data || []).map(rowToItem);
  } catch (error) {
    console.error('Error getting items by type:', error);
    return [];
  }
}

/**
 * Get a single Lost & Found item by ID
 */
export async function getLostFoundItem(id: string): Promise<LostFoundItem | null> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching item:', error);
      return null;
    }

    return data ? rowToItem(data) : null;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
}

/**
 * Add a new Lost & Found item
 */
export async function addLostFoundItem(
  item: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    const row = itemToRow(item);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
}

/**
 * Update a Lost & Found item
 */
export async function updateLostFoundItem(
  id: string,
  updates: Partial<Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    const row = itemToRow(updates);
    row.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(row)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

/**
 * Delete a Lost & Found item
 */
export async function deleteLostFoundItem(id: string): Promise<void> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}
