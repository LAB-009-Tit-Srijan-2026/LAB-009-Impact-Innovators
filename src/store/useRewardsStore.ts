/**
 * src/store/useRewardsStore.ts
 * Traveler Rewards & Loyalty System — persisted in localStorage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserTier = 'Normal' | 'Golden';

export interface TripRecord {
  id: string;
  destination: string;
  distance: number;       // km
  total_amount: number;   // ₹
  completed: boolean;
  completed_at: string;
}

export interface RewardsState {
  // Extended user model
  total_distance_travelled: number;
  total_trips: number;
  reward_points: number;
  discount_percentage: number;
  user_tier: UserTier;

  // Trip history
  trips: TripRecord[];

  // Actions
  addTrip: (trip: Omit<TripRecord, 'id' | 'completed_at'>) => { newTier: UserTier; discountGained: number };
  applyDiscount: (amount: number, category: string) => { discounted: number; saved: number; applied: boolean };
  resetRewards: () => void;
}

const MAX_DISCOUNT = 25;
const GOLDEN_THRESHOLD_KM = 1000;
const MIN_TRIP_KM_FOR_DISCOUNT = 100;
const DISCOUNT_PER_TRIP = 5;
const MIN_BOOKING_FOR_DISCOUNT = 5000;
const GOLDEN_DISCOUNT_CATEGORIES = ['food', 'stay'];
const POINTS_PER_KM = 2;

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      total_distance_travelled: 620,   // seed — user has already travelled 620km
      total_trips: 4,
      reward_points: 1240,
      discount_percentage: 10,
      user_tier: 'Normal',
      trips: [
        { id: 'tr1', destination: 'Jaipur', distance: 280, total_amount: 15000, completed: true, completed_at: '2026-01-14' },
        { id: 'tr2', destination: 'Goa',    distance: 190, total_amount: 12000, completed: true, completed_at: '2026-02-20' },
        { id: 'tr3', destination: 'Manali', distance: 150, total_amount: 20000, completed: true, completed_at: '2026-03-10' },
      ],

      addTrip: (tripData) => {
        const state = get();
        const trip: TripRecord = {
          ...tripData,
          id: `tr_${Date.now()}`,
          completed_at: new Date().toISOString().split('T')[0],
        };

        let newDiscount = state.discount_percentage;
        let discountGained = 0;

        // +5% discount for trips >= 100km, capped at MAX_DISCOUNT
        if (trip.distance >= MIN_TRIP_KM_FOR_DISCOUNT && trip.completed) {
          discountGained = Math.min(DISCOUNT_PER_TRIP, MAX_DISCOUNT - newDiscount);
          newDiscount = Math.min(newDiscount + DISCOUNT_PER_TRIP, MAX_DISCOUNT);
        }

        const newDistance = state.total_distance_travelled + trip.distance;
        const newTrips    = state.total_trips + 1;
        const newPoints   = state.reward_points + Math.floor(trip.distance * POINTS_PER_KM);

        // Golden tier check
        let newTier: UserTier = state.user_tier;
        if (newDistance >= GOLDEN_THRESHOLD_KM) {
          newTier = 'Golden';
          newDiscount = Math.max(newDiscount, MAX_DISCOUNT); // Golden = at least 25%
        }

        set({
          total_distance_travelled: newDistance,
          total_trips: newTrips,
          reward_points: newPoints,
          discount_percentage: newDiscount,
          user_tier: newTier,
          trips: [...state.trips, trip],
        });

        return { newTier, discountGained };
      },

      applyDiscount: (amount: number, category: string) => {
        const { discount_percentage, user_tier } = get();

        // Discount only applies on bookings >= ₹5000
        if (amount < MIN_BOOKING_FOR_DISCOUNT) {
          return { discounted: amount, saved: 0, applied: false };
        }

        // Golden users get 25% on food & stay
        let pct = discount_percentage;
        if (user_tier === 'Golden' && GOLDEN_DISCOUNT_CATEGORIES.includes(category)) {
          pct = MAX_DISCOUNT;
        }

        if (pct === 0) return { discounted: amount, saved: 0, applied: false };

        const saved      = Math.round(amount * pct / 100);
        const discounted = amount - saved;
        return { discounted, saved, applied: true };
      },

      resetRewards: () => set({
        total_distance_travelled: 0,
        total_trips: 0,
        reward_points: 0,
        discount_percentage: 0,
        user_tier: 'Normal',
        trips: [],
      }),
    }),
    {
      name: 'tripnexus-rewards',
      partialize: (s) => ({
        total_distance_travelled: s.total_distance_travelled,
        total_trips: s.total_trips,
        reward_points: s.reward_points,
        discount_percentage: s.discount_percentage,
        user_tier: s.user_tier,
        trips: s.trips,
      }),
    }
  )
);
