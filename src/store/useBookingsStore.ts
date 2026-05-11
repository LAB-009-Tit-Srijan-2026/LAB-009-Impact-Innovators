/**
 * src/store/useBookingsStore.ts
 * Persists all bookings to localStorage so they survive page reloads.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
export type PaymentMethod = 'upi' | 'card' | 'cash' | 'wallet';

export interface SavedBooking {
  id: string;
  userId: string;
  // Listing info
  listingId: string;
  listingTitle: string;
  listingCategory: string;
  listingLocation: string;
  listingImage: string;
  // Booking details
  date: string;
  note: string;
  travelers: string[];
  splitCount: number;
  perPerson: number;
  // Pricing
  originalPrice: number;
  discountPct: number;
  couponCode: string | null;
  finalPrice: number;
  // Payment
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  // Meta
  createdAt: string;
  updatedAt: string;
}

interface BookingsState {
  bookings: SavedBooking[];
  addBooking: (b: Omit<SavedBooking, 'id' | 'createdAt' | 'updatedAt'>) => SavedBooking;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  getByUser: (userId: string) => SavedBooking[];
  getById: (id: string) => SavedBooking | undefined;
  stats: (userId: string) => {
    total: number; confirmed: number; completed: number; cancelled: number;
    totalSpent: number; totalSaved: number;
  };
}

function genId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'TN' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],

      addBooking: (data) => {
        const now = new Date().toISOString();
        const booking: SavedBooking = {
          ...data,
          id: `bk_${genId()}`,
          status: 'confirmed',
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      },

      cancelBooking: (id) => {
        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id ? { ...b, status: 'cancelled', updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      completeBooking: (id) => {
        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id ? { ...b, status: 'completed', updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      getByUser: (userId) => {
        return get().bookings.filter(b => b.userId === userId);
      },

      getById: (id) => {
        return get().bookings.find(b => b.id === id);
      },

      stats: (userId) => {
        const userBookings = get().bookings.filter(b => b.userId === userId);
        return {
          total:      userBookings.length,
          confirmed:  userBookings.filter(b => b.status === 'confirmed').length,
          completed:  userBookings.filter(b => b.status === 'completed').length,
          cancelled:  userBookings.filter(b => b.status === 'cancelled').length,
          totalSpent: userBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.finalPrice, 0),
          totalSaved: userBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.originalPrice - b.finalPrice), 0),
        };
      },
    }),
    {
      name: 'tripnexus-bookings',
    }
  )
);
