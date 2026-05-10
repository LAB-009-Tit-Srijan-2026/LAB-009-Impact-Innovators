/**
 * src/lib/explore-db.ts
 * Realistic in-memory database for Explore Local Marketplace.
 * All tables persist across requests within the same server process.
 * Swap Map → Prisma/MongoDB/Supabase without touching API routes.
 */

import { listings, guides, offbeatLocations } from './explore-local-data';
import type { Listing, Guide } from './explore-local-data';

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ReviewStatus  = 'published' | 'pending_moderation';
export type PartnerStatus = 'active' | 'inactive' | 'suspended';

export interface LocalBooking {
  id: string;
  userId: string;
  listingId: string;
  listingTitle: string;
  listingCategory: string;
  partnerName: string;
  date: string;
  note: string;
  originalPrice: number;
  discountPct: number;
  finalPrice: number;
  status: BookingStatus;
  paymentMethod: 'upi' | 'card' | 'cash' | 'wallet';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  listingId: string;
  rating: number;        // 1–5
  title: string;
  body: string;
  helpful_count: number;
  status: ReviewStatus;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  location: string;
  state: string;
  phone: string;
  email: string;
  verified: boolean;
  status: PartnerStatus;
  total_bookings: number;
  avg_rating: number;
  joined_at: string;
}

export interface WishlistItem {
  userId: string;
  listingId: string;
  addedAt: string;
}

export interface SearchLog {
  query: string;
  category: string | null;
  results_count: number;
  timestamp: string;
}

// ─── IN-MEMORY TABLES ──────────────────────────────────────────────────────────

const bookingsTable  = new Map<string, LocalBooking>();
const reviewsTable   = new Map<string, Review>();
const partnersTable  = new Map<string, Partner>();
const wishlistTable  = new Map<string, WishlistItem>();
const searchLogs: SearchLog[] = [];

// ─── SEED DATA ─────────────────────────────────────────────────────────────────

// Seed partners from listings
const allListings = [...listings, ...guides] as (Listing | Guide)[];
allListings.forEach(l => {
  partnersTable.set(l.partner_id, {
    id: l.partner_id,
    name: l.category === 'guide' ? (l as Guide).name : `${l.title.split('—')[0].trim()} Host`,
    category: l.category,
    location: l.location,
    state: l.state,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
    email: `partner_${l.partner_id}@tripnexus.in`,
    verified: l.rating >= 4.5,
    status: 'active',
    total_bookings: Math.floor(l.reviews * 0.7),
    avg_rating: l.rating,
    joined_at: '2024-01-15',
  });
});

// Seed realistic reviews
const sampleReviews = [
  { listingId: 'l_s1', rating: 5, title: 'Ekdum mast experience!', body: 'Ghar jaisa feel aaya. Khana bahut achha tha, especially Himachali dal. Host family bahut friendly thi. Zaroor dobara aaunga!' },
  { listingId: 'l_s1', rating: 4, title: 'Great value for money', body: 'Mountain views are stunning. Room was clean and cozy. Only issue was hot water timing. Overall highly recommended for budget travelers.' },
  { listingId: 'l_s2', rating: 5, title: 'Backwaters mein sapna sach hua', body: 'Houseboat experience was magical. Chef ne amazing Kerala food banaya. Sunset cruise was the highlight. Worth every rupee!' },
  { listingId: 'l_f1', rating: 5, title: 'Authentic Kumaoni flavors', body: 'Bhatt ki churkani aur aloo ke gutke — bilkul ghar ka khana. Didi ne bahut pyaar se banaya. Bal mithai toh lajawab thi!' },
  { listingId: 'l_f2', rating: 4, title: 'Best street food tour in Varanasi', body: 'Guide knew every hidden spot. Kachori at Kashi Chat Bhandar was life-changing. Lassi at Blue Lassi shop — must try!' },
  { listingId: 'g1',   rating: 5, title: 'Rohan bhai ne trip badal di!', body: 'Hampta Pass trek was challenging but Rohan guided us perfectly. His knowledge of the terrain is incredible. First aid kit always ready. 100% recommend!' },
  { listingId: 'g2',   rating: 5, title: 'Spiritual journey with Pandit ji', body: 'Pandit Ramesh ji ne Varanasi ki asli aatma dikhaayi. Ganga aarti ka experience alag hi level ka tha. His Sanskrit knowledge is deep.' },
  { listingId: 'l_t1', rating: 4, title: 'RE Himalayan — perfect for Spiti', body: 'Bike was well-maintained. Toolkit and route map were helpful. Only suggestion: provide better rain gear. Overall great rental experience.' },
  { listingId: 'l_e1', rating: 5, title: 'Sunrise yoga changed my life', body: 'Waking up at 5 AM was worth it. Ganga ke kinare yoga — peace jo kahi nahi milti. Instructor was certified and very patient with beginners.' },
  { listingId: 'g4',   rating: 5, title: 'Arjun bhai knows every stone!', body: 'He told us stories about Amber Fort that no guidebook has. His French was also impressive for foreign tourists. Best heritage guide in Jaipur!' },
];

const avatars = [
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/women/55.jpg',
  'https://randomuser.me/api/portraits/men/67.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
];
const names = ['Rahul Sharma', 'Priya Nair', 'Arjun Mehta', 'Sneha Patel', 'Vikram Singh', 'Ananya Krishnan'];

sampleReviews.forEach((r, i) => {
  const id = `rev_${i + 1}`;
  reviewsTable.set(id, {
    id,
    userId: `u_${i + 1}`,
    userName: names[i % names.length],
    userAvatar: avatars[i % avatars.length],
    listingId: r.listingId,
    rating: r.rating,
    title: r.title,
    body: r.body,
    helpful_count: Math.floor(Math.random() * 40 + 5),
    status: 'published',
    createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

// Seed some existing bookings for demo user
const demoBookings: Omit<LocalBooking, 'id'>[] = [
  {
    userId: 'demo', listingId: 'l_f2', listingTitle: 'Varanasi Street Food Walk',
    listingCategory: 'food', partnerName: 'Kashi Food Tours',
    date: '2026-04-15', note: 'Vegetarian only please',
    originalPrice: 500, discountPct: 10, finalPrice: 450,
    status: 'completed', paymentMethod: 'upi',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-15T18:00:00Z',
  },
  {
    userId: 'demo', listingId: 'g2', listingTitle: 'Pandit Ramesh Sharma — Kashi Guide',
    listingCategory: 'guide', partnerName: 'Pandit Ramesh Sharma',
    date: '2026-04-16', note: '',
    originalPrice: 1500, discountPct: 0, finalPrice: 1500,
    status: 'completed', paymentMethod: 'cash',
    createdAt: '2026-04-10T10:30:00Z', updatedAt: '2026-04-16T20:00:00Z',
  },
  {
    userId: 'demo', listingId: 'l_s1', listingTitle: 'Himalayan Homestay — Manali',
    listingCategory: 'stay', partnerName: 'Thakur Family Homestay',
    date: '2026-06-20', note: 'Early check-in if possible',
    originalPrice: 1200, discountPct: 25, finalPrice: 900,
    status: 'confirmed', paymentMethod: 'upi',
    createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-05-01T09:05:00Z',
  },
];

demoBookings.forEach((b, i) => {
  const id = `bk_demo_${i + 1}`;
  bookingsTable.set(id, { ...b, id });
});

// ─── BOOKING DB ────────────────────────────────────────────────────────────────

function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'TN' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const bookingDB = {
  create(data: {
    userId: string; listingId: string; listingTitle: string; listingCategory: string;
    partnerName: string; date: string; note: string;
    originalPrice: number; discountPct: number; finalPrice: number;
    paymentMethod: LocalBooking['paymentMethod'];
  }): LocalBooking {
    const id = `bk_${generateBookingRef()}`;
    const now = new Date().toISOString();
    const booking: LocalBooking = {
      ...data, id,
      status: 'confirmed',
      createdAt: now, updatedAt: now,
    };
    bookingsTable.set(id, booking);
    // Update partner booking count
    const listing = allListings.find(l => l.id === data.listingId);
    if (listing) {
      const partner = partnersTable.get(listing.partner_id);
      if (partner) { partner.total_bookings++; partnersTable.set(partner.id, partner); }
    }
    return booking;
  },

  getById(id: string): LocalBooking | null {
    return bookingsTable.get(id) ?? null;
  },

  listByUser(userId: string): LocalBooking[] {
    return Array.from(bookingsTable.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  updateStatus(id: string, status: BookingStatus): LocalBooking | null {
    const b = bookingsTable.get(id);
    if (!b) return null;
    b.status = status;
    b.updatedAt = new Date().toISOString();
    bookingsTable.set(id, b);
    return b;
  },

  cancel(id: string, userId: string): { success: boolean; booking?: LocalBooking; error?: string } {
    const b = bookingsTable.get(id);
    if (!b) return { success: false, error: 'Booking not found' };
    if (b.userId !== userId) return { success: false, error: 'Unauthorized' };
    if (['completed', 'cancelled'].includes(b.status)) return { success: false, error: `Cannot cancel a ${b.status} booking` };
    b.status = 'cancelled';
    b.updatedAt = new Date().toISOString();
    bookingsTable.set(id, b);
    return { success: true, booking: b };
  },

  stats(userId: string) {
    const userBookings = bookingDB.listByUser(userId);
    return {
      total:     userBookings.length,
      confirmed: userBookings.filter(b => b.status === 'confirmed').length,
      completed: userBookings.filter(b => b.status === 'completed').length,
      cancelled: userBookings.filter(b => b.status === 'cancelled').length,
      total_spent: userBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.finalPrice, 0),
      total_saved: userBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.originalPrice - b.finalPrice), 0),
    };
  },
};

// ─── REVIEW DB ─────────────────────────────────────────────────────────────────

export const reviewDB = {
  create(data: {
    userId: string; userName: string; userAvatar: string;
    listingId: string; rating: number; title: string; body: string;
  }): Review {
    const id = `rev_${Date.now()}`;
    const review: Review = {
      ...data, id,
      helpful_count: 0,
      status: 'published',
      createdAt: new Date().toISOString(),
    };
    reviewsTable.set(id, review);
    return review;
  },

  getByListing(listingId: string): Review[] {
    return Array.from(reviewsTable.values())
      .filter(r => r.listingId === listingId && r.status === 'published')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  markHelpful(reviewId: string): Review | null {
    const r = reviewsTable.get(reviewId);
    if (!r) return null;
    r.helpful_count++;
    reviewsTable.set(reviewId, r);
    return r;
  },

  avgRating(listingId: string): number {
    const reviews = reviewDB.getByListing(listingId);
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  },
};

// ─── PARTNER DB ────────────────────────────────────────────────────────────────

export const partnerDB = {
  getById(id: string): Partner | null {
    return partnersTable.get(id) ?? null;
  },

  getByListing(listingId: string): Partner | null {
    const listing = allListings.find(l => l.id === listingId);
    if (!listing) return null;
    return partnersTable.get(listing.partner_id) ?? null;
  },

  list(filters?: { state?: string; category?: string; verified?: boolean }): Partner[] {
    let all = Array.from(partnersTable.values()).filter(p => p.status === 'active');
    if (filters?.state)    all = all.filter(p => p.state.toLowerCase().includes(filters.state!.toLowerCase()));
    if (filters?.category) all = all.filter(p => p.category === filters.category);
    if (filters?.verified !== undefined) all = all.filter(p => p.verified === filters.verified);
    return all.sort((a, b) => b.avg_rating - a.avg_rating);
  },

  topRated(limit = 5): Partner[] {
    return partnerDB.list().slice(0, limit);
  },
};

// ─── WISHLIST DB ───────────────────────────────────────────────────────────────

export const wishlistDB = {
  toggle(userId: string, listingId: string): { added: boolean } {
    const key = `${userId}_${listingId}`;
    if (wishlistTable.has(key)) {
      wishlistTable.delete(key);
      return { added: false };
    }
    wishlistTable.set(key, { userId, listingId, addedAt: new Date().toISOString() });
    return { added: true };
  },

  getByUser(userId: string): string[] {
    return Array.from(wishlistTable.values())
      .filter(w => w.userId === userId)
      .map(w => w.listingId);
  },

  isWishlisted(userId: string, listingId: string): boolean {
    return wishlistTable.has(`${userId}_${listingId}`);
  },
};

// ─── SEARCH LOG ────────────────────────────────────────────────────────────────

export const searchDB = {
  log(query: string, category: string | null, results_count: number) {
    searchLogs.push({ query, category, results_count, timestamp: new Date().toISOString() });
    if (searchLogs.length > 500) searchLogs.shift(); // keep last 500
  },

  trending(limit = 5): string[] {
    const freq = new Map<string, number>();
    searchLogs.slice(-100).forEach(l => {
      if (l.query.length > 2) freq.set(l.query, (freq.get(l.query) ?? 0) + 1);
    });
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
  },
};

// ─── AVAILABILITY CHECK ────────────────────────────────────────────────────────

export const availabilityDB = {
  check(listingId: string, date: string): { available: boolean; slots_left: number; next_available?: string } {
    // Simulate: some dates are booked
    const bookedDates = Array.from(bookingsTable.values())
      .filter(b => b.listingId === listingId && b.status !== 'cancelled')
      .map(b => b.date);

    const isBooked = bookedDates.includes(date);
    const slots_left = isBooked ? 0 : Math.floor(Math.random() * 4 + 1);

    if (isBooked) {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return { available: false, slots_left: 0, next_available: d.toISOString().split('T')[0] };
    }
    return { available: true, slots_left };
  },
};

// ─── COUPON DB ─────────────────────────────────────────────────────────────────

export interface Coupon {
  code: string;
  discount_pct: number;
  description: string;
  condition: 'first_booking' | 'always' | 'min_amount';
  min_amount?: number;
  active: boolean;
}

export interface UserCouponState {
  userId: string;
  is_first_booking: boolean;
  used_coupons: string[];
}

const couponsTable = new Map<string, Coupon>([
  ['FIRST5',   { code: 'FIRST5',   discount_pct: 5,  description: 'First booking pe 5% off!',       condition: 'first_booking', active: true }],
  ['WELCOME10',{ code: 'WELCOME10',discount_pct: 10, description: 'Welcome discount — 10% off!',    condition: 'first_booking', active: true }],
  ['INDIA15',  { code: 'INDIA15',  discount_pct: 15, description: 'Incredible India — 15% off ₹5000+', condition: 'min_amount', min_amount: 5000, active: true }],
  ['SAVE20',   { code: 'SAVE20',   discount_pct: 20, description: '20% off on bookings above ₹8000', condition: 'min_amount', min_amount: 8000, active: true }],
]);

const userCouponStates = new Map<string, UserCouponState>();

export const couponDB = {
  getAll(): Coupon[] {
    return Array.from(couponsTable.values()).filter(c => c.active);
  },

  validate(code: string, userId: string, amount: number): {
    valid: boolean; discount_pct: number; message: string; coupon?: Coupon;
  } {
    const coupon = couponsTable.get(code.toUpperCase());
    if (!coupon || !coupon.active) {
      return { valid: false, discount_pct: 0, message: 'Invalid or expired coupon code' };
    }

    const state = userCouponStates.get(userId) ?? { userId, is_first_booking: true, used_coupons: [] };

    if (state.used_coupons.includes(code.toUpperCase())) {
      return { valid: false, discount_pct: 0, message: 'Yeh coupon already use ho chuka hai' };
    }

    if (coupon.condition === 'first_booking' && !state.is_first_booking) {
      return { valid: false, discount_pct: 0, message: 'Yeh coupon sirf pehli booking ke liye hai' };
    }

    if (coupon.condition === 'min_amount' && amount < (coupon.min_amount ?? 0)) {
      return { valid: false, discount_pct: 0, message: `Minimum booking amount ₹${coupon.min_amount?.toLocaleString()} hona chahiye` };
    }

    return { valid: true, discount_pct: coupon.discount_pct, message: `${coupon.discount_pct}% discount apply ho gaya! 🎉`, coupon };
  },

  apply(code: string, userId: string): void {
    const state = userCouponStates.get(userId) ?? { userId, is_first_booking: true, used_coupons: [] };
    state.used_coupons.push(code.toUpperCase());
    state.is_first_booking = false;
    userCouponStates.set(userId, state);
  },

  getUserState(userId: string): UserCouponState {
    return userCouponStates.get(userId) ?? { userId, is_first_booking: true, used_coupons: [] };
  },
};

// ─── EXPENSE SPLIT ─────────────────────────────────────────────────────────────

export interface SplitDetail {
  name: string;
  amount: number;
  paid: boolean;
}

export interface ExpenseSplit {
  bookingId: string;
  total_amount: number;
  split_count: number;
  per_person: number;
  splits: SplitDetail[];
  createdAt: string;
}

const splitsTable = new Map<string, ExpenseSplit>();

export const splitDB = {
  create(bookingId: string, totalAmount: number, travelers: string[]): ExpenseSplit {
    const count      = travelers.length || 1;
    const perPerson  = Math.ceil(totalAmount / count);
    const splits: SplitDetail[] = travelers.map(name => ({ name, amount: perPerson, paid: false }));

    const split: ExpenseSplit = {
      bookingId, total_amount: totalAmount,
      split_count: count, per_person: perPerson,
      splits, createdAt: new Date().toISOString(),
    };
    splitsTable.set(bookingId, split);
    return split;
  },

  get(bookingId: string): ExpenseSplit | null {
    return splitsTable.get(bookingId) ?? null;
  },

  markPaid(bookingId: string, travelerName: string): ExpenseSplit | null {
    const split = splitsTable.get(bookingId);
    if (!split) return null;
    const s = split.splits.find(s => s.name === travelerName);
    if (s) s.paid = true;
    splitsTable.set(bookingId, split);
    return split;
  },
};

// ─── FEEDBACK DB ───────────────────────────────────────────────────────────────

export interface TripFeedback {
  id: string;
  userId: string;
  bookingId: string;
  listingId: string;
  listingTitle: string;
  // Category ratings 1–5
  safety_rating:        number;
  budget_rating:        number;
  experience_rating:    number;
  accommodation_rating: number;
  location_rating:      number;
  overall_rating:       number;  // auto-calculated average
  comment: string;
  would_recommend: boolean;
  createdAt: string;
}

const feedbackTable = new Map<string, TripFeedback>();

export const feedbackDB = {
  create(data: Omit<TripFeedback, 'id' | 'overall_rating' | 'createdAt'>): TripFeedback {
    const overall = Math.round(
      (data.safety_rating + data.budget_rating + data.experience_rating +
       data.accommodation_rating + data.location_rating) / 5 * 10
    ) / 10;

    const feedback: TripFeedback = {
      ...data,
      id: `fb_${Date.now()}`,
      overall_rating: overall,
      createdAt: new Date().toISOString(),
    };
    feedbackTable.set(feedback.id, feedback);
    return feedback;
  },

  getByBooking(bookingId: string): TripFeedback | null {
    return Array.from(feedbackTable.values()).find(f => f.bookingId === bookingId) ?? null;
  },

  getByListing(listingId: string): TripFeedback[] {
    return Array.from(feedbackTable.values())
      .filter(f => f.listingId === listingId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  avgByListing(listingId: string): {
    overall: number; safety: number; budget: number;
    experience: number; accommodation: number; location: number; count: number;
  } {
    const items = feedbackDB.getByListing(listingId);
    if (!items.length) return { overall: 0, safety: 0, budget: 0, experience: 0, accommodation: 0, location: 0, count: 0 };
    const avg = (key: keyof TripFeedback) =>
      Math.round(items.reduce((s, f) => s + (f[key] as number), 0) / items.length * 10) / 10;
    return {
      overall:       avg('overall_rating'),
      safety:        avg('safety_rating'),
      budget:        avg('budget_rating'),
      experience:    avg('experience_rating'),
      accommodation: avg('accommodation_rating'),
      location:      avg('location_rating'),
      count: items.length,
    };
  },

  hasSubmitted(bookingId: string): boolean {
    return Array.from(feedbackTable.values()).some(f => f.bookingId === bookingId);
  },
};

// ─── EXTENDED BOOKING (with split + coupon fields) ─────────────────────────────
// These are stored alongside the booking in a separate metadata table
export interface BookingMeta {
  bookingId: string;
  coupon_applied: string | null;
  split_count: number;
  traveler_names: string[];
  invoice_generated: boolean;
}

const bookingMetaTable = new Map<string, BookingMeta>();

export const bookingMetaDB = {
  set(bookingId: string, meta: Omit<BookingMeta, 'bookingId'>): BookingMeta {
    const record = { bookingId, ...meta };
    bookingMetaTable.set(bookingId, record);
    return record;
  },
  get(bookingId: string): BookingMeta | null {
    return bookingMetaTable.get(bookingId) ?? null;
  },
};
