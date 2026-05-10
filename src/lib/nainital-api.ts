/**
 * src/lib/nainital-api.ts
 * Typed client for all TripNexus Nainital API routes.
 * Import these functions in your components — never call fetch() directly.
 */

export type CheckState = 'complete' | 'incomplete' | 'pending';

export interface ChecklistRecord {
  userId: string;
  destination: string;
  stateMap: Record<string, CheckState>;
  updatedAt: string;
}

export interface BookingRecord {
  id: string;
  userId: string;
  destination: string;
  type: 'vehicle' | 'stay';
  itemId: string;
  itemName: string;
  pricePerUnit: number;
  days?: number;
  nights?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface GourmetOrderRecord {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  action: 'order_delivery' | 'book_table' | 'track_order' | 'view_menu';
  status: 'placed' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface WeatherRecord {
  destination: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  icon: string;
  updatedAt: string;
}

// ─── Base helper ───────────────────────────────────────────────────────────────
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data as T;
}

// ─── Checklist API ─────────────────────────────────────────────────────────────
export const checklistApi = {
  /** Fetch full checklist stateMap from server */
  get(userId = 'demo'): Promise<ChecklistRecord> {
    return apiFetch(`/api/nainital/checklist?userId=${userId}`);
  },

  /** Save entire stateMap to server */
  save(stateMap: Record<string, CheckState>, userId = 'demo'): Promise<ChecklistRecord> {
    return apiFetch('/api/nainital/checklist', {
      method: 'POST',
      body: JSON.stringify({ userId, stateMap }),
    });
  },

  /** Patch a single item (optimistic update) */
  patchItem(itemId: string, state: CheckState, userId = 'demo'): Promise<ChecklistRecord> {
    return apiFetch('/api/nainital/checklist', {
      method: 'PATCH',
      body: JSON.stringify({ userId, itemId, state }),
    });
  },

  /** Reset checklist to defaults */
  reset(userId = 'demo'): Promise<ChecklistRecord> {
    return apiFetch(`/api/nainital/checklist?userId=${userId}`, { method: 'DELETE' });
  },
};

// ─── Bookings API ──────────────────────────────────────────────────────────────
export const bookingsApi = {
  /** Get all bookings for a user */
  list(userId = 'demo'): Promise<BookingRecord[]> {
    return apiFetch(`/api/nainital/bookings?userId=${userId}`);
  },

  /** Create a vehicle booking */
  bookVehicle(params: {
    itemId: string; itemName: string; pricePerUnit: number; days?: number; userId?: string;
  }): Promise<BookingRecord> {
    return apiFetch('/api/nainital/bookings', {
      method: 'POST',
      body: JSON.stringify({ type: 'vehicle', userId: 'demo', ...params }),
    });
  },

  /** Create a stay booking */
  bookStay(params: {
    itemId: string; itemName: string; pricePerUnit: number; nights?: number; userId?: string;
  }): Promise<BookingRecord> {
    return apiFetch('/api/nainital/bookings', {
      method: 'POST',
      body: JSON.stringify({ type: 'stay', userId: 'demo', ...params }),
    });
  },

  /** Cancel a booking */
  cancel(bookingId: string): Promise<BookingRecord> {
    return apiFetch(`/api/nainital/bookings?bookingId=${bookingId}`, { method: 'DELETE' });
  },
};

// ─── Gourmet API ───────────────────────────────────────────────────────────────
export const gourmetApi = {
  /** Get all orders for a user */
  list(userId = 'demo'): Promise<GourmetOrderRecord[]> {
    return apiFetch(`/api/nainital/gourmet?userId=${userId}`);
  },

  /** Place an order or book a table */
  action(params: {
    restaurantId: string;
    restaurantName: string;
    action: GourmetOrderRecord['action'];
    userId?: string;
  }): Promise<GourmetOrderRecord> {
    return apiFetch('/api/nainital/gourmet', {
      method: 'POST',
      body: JSON.stringify({ userId: 'demo', ...params }),
    });
  },
};

// ─── Weather API ───────────────────────────────────────────────────────────────
export const weatherApi = {
  get(destination = 'nainital'): Promise<WeatherRecord> {
    return apiFetch(`/api/nainital/weather?destination=${destination}`);
  },
};
