/**
 * src/lib/db.ts
 * In-memory database layer for TripNexus Nainital backend.
 * Swap this file's internals for Prisma / MongoDB / Supabase
 * without touching any API route or frontend code.
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

// ─── In-Memory Tables ──────────────────────────────────────────────────────────
// In production: replace with DB queries

const checklistTable = new Map<string, ChecklistRecord>();
const bookingsTable  = new Map<string, BookingRecord>();
const gourmetTable   = new Map<string, GourmetOrderRecord>();

// Seed default checklist for demo user
const DEFAULT_CHECKLIST: Record<string, CheckState> = {
  ck_docs: 'complete', ck_id: 'complete', ck_permit: 'complete', ck_insurance: 'incomplete',
  ck_accom: 'pending', ck_hotel: 'complete', ck_pg: 'pending', ck_resort: 'incomplete', ck_hostel: 'pending',
  ck_traveler: 'pending', ck_family: 'complete', ck_couple: 'incomplete', ck_adventure: 'pending', ck_solo: 'incomplete',
  ck_dining: 'pending', ck_local: 'complete', ck_cafe: 'complete', ck_finedine: 'pending', ck_streetfood: 'incomplete',
  ck_gear: 'incomplete', ck_warmclothes: 'complete', ck_trekshoes: 'incomplete', ck_raincoat: 'pending', ck_powerbank: 'complete',
};

checklistTable.set('demo_nainital', {
  userId: 'demo',
  destination: 'nainital',
  stateMap: { ...DEFAULT_CHECKLIST },
  updatedAt: new Date().toISOString(),
});

// ─── Checklist DB ops ──────────────────────────────────────────────────────────
export const checklistDB = {
  get(userId: string, destination: string): ChecklistRecord | null {
    return checklistTable.get(`${userId}_${destination}`) ?? null;
  },
  upsert(userId: string, destination: string, stateMap: Record<string, CheckState>): ChecklistRecord {
    const record: ChecklistRecord = {
      userId, destination, stateMap,
      updatedAt: new Date().toISOString(),
    };
    checklistTable.set(`${userId}_${destination}`, record);
    return record;
  },
  patchItem(userId: string, destination: string, itemId: string, state: CheckState): ChecklistRecord | null {
    const key = `${userId}_${destination}`;
    const existing = checklistTable.get(key);
    if (!existing) return null;
    existing.stateMap[itemId] = state;
    existing.updatedAt = new Date().toISOString();
    checklistTable.set(key, existing);
    return existing;
  },
  reset(userId: string, destination: string): ChecklistRecord {
    return checklistDB.upsert(userId, destination, { ...DEFAULT_CHECKLIST });
  },
};

// ─── Bookings DB ops ───────────────────────────────────────────────────────────
export const bookingsDB = {
  create(data: Omit<BookingRecord, 'id' | 'createdAt'>): BookingRecord {
    const record: BookingRecord = {
      ...data,
      id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    bookingsTable.set(record.id, record);
    return record;
  },
  listByUser(userId: string): BookingRecord[] {
    return Array.from(bookingsTable.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  cancel(bookingId: string): BookingRecord | null {
    const b = bookingsTable.get(bookingId);
    if (!b) return null;
    b.status = 'cancelled';
    bookingsTable.set(bookingId, b);
    return b;
  },
};

// ─── Gourmet DB ops ────────────────────────────────────────────────────────────
export const gourmetDB = {
  create(data: Omit<GourmetOrderRecord, 'id' | 'createdAt'>): GourmetOrderRecord {
    const record: GourmetOrderRecord = {
      ...data,
      id: `go_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    gourmetTable.set(record.id, record);
    return record;
  },
  listByUser(userId: string): GourmetOrderRecord[] {
    return Array.from(gourmetTable.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

// ─── Weather (static seed, replace with real API call) ─────────────────────────
const weatherSeeds: Record<string, WeatherRecord> = {
  nainital: {
    destination: 'nainital', temp: 14, condition: 'Cloudy',
    humidity: 72, wind: 12, icon: '⛅',
    updatedAt: new Date().toISOString(),
  },
};

export const weatherDB = {
  get(destination: string): WeatherRecord | null {
    return weatherSeeds[destination.toLowerCase()] ?? null;
  },
};
