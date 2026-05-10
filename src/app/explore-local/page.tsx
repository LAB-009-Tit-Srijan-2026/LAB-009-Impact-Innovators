'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/store/useAppStore';
import { useRewardsStore } from '@/store/useRewardsStore';
import { useRouter } from 'next/navigation';
import { RewardsWidget, SavingsBanner, GoldenBadge, DiscountBadge } from '@/components/ui/RewardsWidget';
import {
  listings, guides, offbeatLocations, getAIRecommendations,
} from '@/lib/explore-local-data';
import type { Listing, Guide, OffbeatLocation, ListingCategory, TripPreferences } from '@/lib/explore-local-data';
import {
  Sparkles, Star, MapPin, Clock, Users, IndianRupee,
  Globe, Home, Utensils, Backpack, ShoppingBag, Car,
  Compass, X, ChevronRight, Phone, Calendar, Languages,
  Award, Zap, Filter, Search, Heart, Share2, Trophy, Crown, Gift,
  ThumbsUp, MessageSquare, CheckCircle2, AlertCircle, Loader2,
  CreditCard, Wallet, Banknote, Smartphone
} from 'lucide-react';

// ─── CATEGORY CONFIG ───────────────────────────────────────────────────────────
const categories: { id: ListingCategory | 'all'; label: string; emoji: string; color: string }[] = [
  { id: 'all',        label: 'Sab Dekho',          emoji: '🌍', color: 'from-purple-500 to-pink-500'   },
  { id: 'stay',       label: 'Stay with Locals',   emoji: '🏡', color: 'from-orange-400 to-amber-500'  },
  { id: 'food',       label: 'Taste Local Food',   emoji: '🍛', color: 'from-red-400 to-orange-500'    },
  { id: 'experience', label: 'Explore Experiences',emoji: '🎒', color: 'from-teal-400 to-emerald-500'  },
  { id: 'shop',       label: 'Shop Local',         emoji: '🛍️', color: 'from-pink-400 to-rose-500'    },
  { id: 'transport',  label: 'Local Transport',    emoji: '🚗', color: 'from-blue-400 to-indigo-500'   },
  { id: 'guide',      label: 'Book a Guide',       emoji: '🧭', color: 'from-violet-500 to-purple-600' },
];

const guideTypeLabels: Record<string, string> = {
  trekking: '🏔️ Trekking', spiritual: '🕌 Spiritual',
  city: '🏙️ City', wildlife: '🐯 Wildlife', heritage: '🏛️ Heritage',
};

const crowdColors = {
  very_low: 'bg-emerald-100 text-emerald-700',
  low:      'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
};

// ─── LISTING CARD ──────────────────────────────────────────────────────────────
function ListingCard({ item, onBook }: { item: Listing | Guide; onBook: (item: Listing | Guide) => void }) {
  const [saved, setSaved] = useState(false);
  const isGuide = item.category === 'guide';
  const guide   = isGuide ? (item as Guide) : null;
  const cat     = categories.find(c => c.id === item.category);
  const { discount_percentage, user_tier, applyDiscount } = useRewardsStore();
  const { discounted, saved: savedAmt, applied } = applyDiscount(item.price, item.category);
  const isGoldenEligible = user_tier === 'Golden' && ['food', 'stay'].includes(item.category);
  const effectivePct = isGoldenEligible ? 25 : (applied ? discount_percentage : 0);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${cat?.color ?? 'from-purple-500 to-pink-500'}`}>
          {cat?.emoji} {cat?.label}
        </span>
        {/* Save button */}
        <button onClick={() => setSaved(p => !p)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
        {/* Guide avatar overlay */}
        {guide && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <img src={guide.avatar} alt={guide.name} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
            <div>
              <p className="text-white text-xs font-bold">{guide.name}</p>
              <p className="text-white/80 text-xs">{guide.experience_years} yrs exp</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">{item.title}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{item.rating}</span>
            <span className="text-xs text-gray-400">({item.reviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{item.location}, {item.state}</span>
        </div>

        {/* Guide-specific info */}
        {guide && (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                {guideTypeLabels[guide.guide_type]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Languages className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{guide.languages.slice(0, 3).join(', ')}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1 italic">{guide.speciality}</p>
          </div>
        )}

        {!guide && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
        )}

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mb-3">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            {applied && effectivePct > 0 ? (
              <div>
                <span className="text-xs text-gray-400 line-through">₹{item.price.toLocaleString()}</span>
                <span className={`text-lg font-extrabold ml-1 ${isGoldenEligible ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₹{discounted.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">/{item.pricing_type}</span>
                <p className={`text-xs font-semibold ${isGoldenEligible ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isGoldenEligible ? '👑' : '🎁'} You save ₹{savedAmt.toLocaleString()} ({effectivePct}% off)
                </p>
              </div>
            ) : (
              <div>
                <span className="text-lg font-extrabold text-gray-800">₹{item.price.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-1">/{item.pricing_type}</span>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onBook(item)}
            className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
          >
            {isGuide ? 'Book Guide' : 'Book Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── OFFBEAT CARD ──────────────────────────────────────────────────────────────
function OffbeatCard({ loc, onExplore }: { loc: OffbeatLocation; onExplore: (loc: OffbeatLocation) => void }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => onExplore(loc)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow"
      style={{ height: '260px' }}
    >
      <img src={loc.image} alt={loc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Tags */}
      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
        {loc.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {tag}
          </span>
        ))}
      </div>

      {/* Crowd badge */}
      <div className="absolute top-3 right-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${crowdColors[loc.crowd_level]}`}>
          {loc.crowd_level === 'very_low' ? '🟢 Very Quiet' : loc.crowd_level === 'low' ? '🟡 Low Crowd' : '🟠 Moderate'}
        </span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3 text-white/70" />
          <span className="text-white/70 text-xs">{loc.state}</span>
        </div>
        <h3 className="text-white font-bold text-base leading-tight mb-1">{loc.title}</h3>
        <p className="text-white/75 text-xs line-clamp-2 mb-2">{loc.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">Best: {loc.best_time}</span>
          <span className="text-xs text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            Explore <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── BOOKING MODAL ─────────────────────────────────────────────────────────────
function BookingModal({ item, onClose, onConfirm }: {
  item: Listing | Guide;
  onClose: () => void;
  onConfirm: (item: Listing | Guide, date: string, note: string) => void;
}) {
  const [date, setDate]         = useState('');
  const [note, setNote]         = useState('');
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [avail, setAvail] = useState<{ available: boolean; slots_left: number; next_available?: string } | null>(null);
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'cash' | 'wallet'>('upi');
  const isGuide = item.category === 'guide';
  const guide   = isGuide ? (item as Guide) : null;
  const { applyDiscount, user_tier } = useRewardsStore();
  const { discounted, saved: savedAmt, applied } = applyDiscount(item.price, item.category);
  const isGoldenEligible = user_tier === 'Golden' && ['food', 'stay'].includes(item.category);

  // Check availability when date changes
  useEffect(() => {
    if (!date) { setAvail(null); return; }
    fetch(`/api/explore/availability?listingId=${item.id}&date=${date}`)
      .then(r => r.json())
      .then(j => setAvail(j.data))
      .catch(() => {});
  }, [date, item.id]);

  const router = useRouter();

  async function handleConfirm() {
    if (!date) return;
    setLoading(true);
    setApiError('');
    try {
      const params = new URLSearchParams({
        listingId: item.id,
        title:     item.title,
        category:  item.category,
        location:  item.location,
        price:     String(item.price),
        date,
        pay:       payMethod,
        note,
      });
      onClose();
      router.push(`/invoice?${params.toString()}`);
    } catch {
      setApiError('Navigation failed — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {done ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              ✅
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed! 🎉</h3>
            <p className="text-gray-500 text-sm mb-1">
              <strong>{isGuide ? (item as Guide).name : item.title}</strong> booked successfully
            </p>
            <p className="text-gray-400 text-xs mb-1">Ref: <span className="font-mono font-bold text-purple-600">{bookingRef}</span></p>
            <p className="text-gray-400 text-xs mb-6">Confirmation SMS/email bheja jayega</p>
            <button onClick={onClose}
              className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative h-36 overflow-hidden">
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
              {guide && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <img src={guide.avatar} alt={guide.name} className="w-10 h-10 rounded-full border-2 border-white" />
                  <div>
                    <p className="text-white font-bold text-sm">{guide.name}</p>
                    <p className="text-white/80 text-xs">{guideTypeLabels[guide.guide_type]}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-bold text-gray-800 text-base mb-1">{item.title}</h3>
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{item.rating}</span>
                <span className="font-semibold text-purple-600">₹{item.price.toLocaleString()}/{item.pricing_type}</span>
              </div>

              {/* Discount row */}
              {applied && (
                <div className={`flex items-center gap-2 rounded-xl p-3 mb-4 ${isGoldenEligible ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <span className="text-lg">{isGoldenEligible ? '👑' : '🎁'}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${isGoldenEligible ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {isGoldenEligible ? 'Golden Traveler Discount Applied!' : 'Your Rewards Discount Applied!'}
                    </p>
                    <p className={`text-xs ${isGoldenEligible ? 'text-amber-700' : 'text-emerald-700'}`}>
                      You save <strong>₹{savedAmt.toLocaleString()}</strong> — Pay only <strong>₹{discounted.toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
              )}

              {guide && (
                <div className="bg-purple-50 rounded-2xl p-3 mb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    <span>{guide.experience_years} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Languages className="w-3.5 h-3.5 text-purple-500" />
                    <span>{guide.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Compass className="w-3.5 h-3.5 text-purple-500" />
                    <span className="line-clamp-1">{guide.speciality}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500" />
                  {avail && date && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${avail.available ? 'text-emerald-600' : 'text-red-500'}`}>
                      {avail.available
                        ? <><CheckCircle2 className="w-3 h-3" />{avail.slots_left} slot{avail.slots_left !== 1 ? 's' : ''} available</>
                        : <><AlertCircle className="w-3 h-3" />Fully booked — next available: {avail.next_available}</>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { id: 'upi',    icon: Smartphone, label: 'UPI'    },
                      { id: 'card',   icon: CreditCard, label: 'Card'   },
                      { id: 'wallet', icon: Wallet,     label: 'Wallet' },
                      { id: 'cash',   icon: Banknote,   label: 'Cash'   },
                    ] as const).map(pm => (
                      <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                          payMethod === pm.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                        <pm.icon className="w-4 h-4" />{pm.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Special Request (optional)</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                    placeholder="Koi special requirement hai?"
                    className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 resize-none" />
                </div>
              </div>

              {apiError && (
                <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />{apiError}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={!date || loading || (avail !== null && !avail.available)}
                className="w-full py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking ho raha hai...</>
                  : isGuide ? '🧭 Confirm Guide Booking' : '✅ Confirm Booking'}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── OFFBEAT DETAIL MODAL ──────────────────────────────────────────────────────
function OffbeatModal({ loc, onClose, onBook }: {
  loc: OffbeatLocation;
  onClose: () => void;
  onBook: (item: Listing | Guide) => void;
}) {
  const all = [...listings, ...guides] as any[];
  const nearby = loc.nearby_listing_ids.map(id => all.find(l => l.id === id)).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-52 overflow-hidden">
          <img src={loc.image} alt={loc.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-4">
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {loc.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">{t}</span>
              ))}
            </div>
            <h2 className="text-white font-bold text-xl">{loc.title}</h2>
            <p className="text-white/80 text-sm">{loc.state}</p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{loc.description}</p>
          <div className="flex gap-4 mb-5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" />Best: {loc.best_time}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${crowdColors[loc.crowd_level]}`}>
              {loc.crowd_level === 'very_low' ? '🟢 Very Quiet' : '🟡 Low Crowd'}
            </span>
          </div>

          {nearby.length > 0 && (
            <>
              <h3 className="font-bold text-gray-800 text-sm mb-3">Nearby Services 📍</h3>
              <div className="space-y-3">
                {nearby.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl">
                    <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">₹{item.price.toLocaleString()}/{item.pricing_type}</p>
                    </div>
                    <button onClick={() => { onBook(item); onClose(); }}
                      className="text-xs px-3 py-1.5 text-white rounded-xl font-medium flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ExploreLocalPage() {
  const { tripForm, user } = useAppStore();
  const rewards = useRewardsStore();
  const [activeCategory, setActiveCategory] = useState<ListingCategory | 'all'>('all');
  const [search, setSearch]                 = useState('');
  const [bookingItem, setBookingItem]       = useState<Listing | Guide | null>(null);
  const [offbeatItem, setOffbeatItem]       = useState<OffbeatLocation | null>(null);
  const [toast, setToast]                   = useState('');

  const isGolden = rewards.user_tier === 'Golden';

  // AI preferences from tripForm
  const prefs: TripPreferences = {
    budget:      tripForm.budget[1] <= 8000 ? 'low' : tripForm.budget[1] <= 20000 ? 'medium' : 'high',
    group_size:  tripForm.travelers,
    travel_type: tripForm.type,
    destination: tripForm.destination || undefined,
  };
  const aiRecs = getAIRecommendations(prefs);

  // Filtered listings
  const allItems = [...listings, ...guides] as (Listing | Guide)[];
  const filtered = allItems.filter(item => {
    const matchCat    = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  function handleBook(item: Listing | Guide) {
    setBookingItem(item);
  }

  function handleConfirmBooking(item: Listing | Guide, date: string, note: string) {
    // Add trip to rewards system (simulate 200km for demo)
    const dist = 150 + Math.floor(Math.random() * 200);
    const result = rewards.addTrip({
      destination: item.location,
      distance: dist,
      total_amount: item.price,
      completed: true,
    });
    const name = item.category === 'guide' ? (item as Guide).name : item.title;
    let msg = `✅ ${name} booked for ${date}!`;
    if (result.discountGained > 0) msg += ` +${result.discountGained}% discount earned!`;
    if (result.newTier === 'Golden') msg = `👑 Golden Status Unlocked! ${msg}`;
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  }

  return (
    <AppLayout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-white border border-purple-200 rounded-2xl px-5 py-3 shadow-xl text-sm font-medium text-gray-800"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {bookingItem && (
          <BookingModal item={bookingItem} onClose={() => setBookingItem(null)} onConfirm={handleConfirmBooking} />
        )}
        {offbeatItem && (
          <OffbeatModal loc={offbeatItem} onClose={() => setOffbeatItem(null)} onBook={handleBook} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── PAGE HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl p-8"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%)' }}>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i}
                animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl"
                style={{ left: `${10 + i * 16}%`, top: `${10 + (i % 3) * 30}%` }}
              />
            ))}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                🌍 Local Partner Marketplace
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 leading-tight">
              Smart, Affordable &<br />Local Travel Experiences
            </h1>
            <p className="text-white/80 text-sm max-w-lg">
              Authentic stays, local food, expert guides, and offbeat destinations — all handpicked by AI for your travel style.
            </p>
          </div>
        </div>

        {/* ── SAVINGS BANNER ── */}
        <SavingsBanner />

        {/* ── REWARDS + PROFILE ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Rewards widget */}
          <div className="lg:col-span-2">
            <RewardsWidget />
          </div>
          {/* Profile card */}
          <div className={`rounded-3xl p-5 border flex flex-col justify-between ${
            isGolden ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50' : 'border-purple-100 bg-white'
          } shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img src={user?.avatar} alt={user?.name}
                  className={`w-14 h-14 rounded-2xl object-cover ring-4 ${isGolden ? 'ring-amber-300' : 'ring-purple-100'}`} />
                {isGolden && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs">
                    👑
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.location}</p>
                {isGolden
                  ? <GoldenBadge size="sm" />
                  : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Normal Traveler</span>}
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Distance Travelled', value: `${rewards.total_distance_travelled.toLocaleString()} km`, color: 'text-purple-600' },
                { label: 'Trips Completed',    value: rewards.total_trips.toString(),                            color: 'text-blue-600'   },
                { label: 'Reward Points',      value: rewards.reward_points.toLocaleString(),                   color: 'text-amber-600'  },
                { label: 'Current Discount',   value: `${rewards.discount_percentage}%`,                        color: 'text-emerald-600'},
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI RECOMMENDATIONS ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Recommended for You 🤖</h2>
              <p className="text-xs text-gray-500">
                Based on your {prefs.budget} budget · {tripForm.type} · {tripForm.travelers} travelers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecs.map((rec, i) => (
              <motion.div
                key={rec.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{rec.emoji}</span>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">{rec.label}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {rec.item.category === 'guide' && (
                    <img src={(rec.item as Guide).avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{rec.item.title}</p>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{rec.reason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">₹{rec.item.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/{rec.item.pricing_type}</span></span>
                  <button onClick={() => handleBook(rec.item)}
                    className="text-xs px-3 py-1.5 text-white rounded-xl font-medium"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                    Book
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CATEGORY CARDS ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  activeCategory === cat.id
                    ? 'border-purple-500 shadow-lg shadow-purple-100'
                    : 'border-transparent bg-white hover:border-purple-200 shadow-sm'
                }`}
                style={activeCategory === cat.id ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(219,39,119,0.06))' } : {}}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── LISTINGS GRID ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              {activeCategory === 'all' ? 'All Listings' : categories.find(c => c.id === activeCategory)?.label}
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} results)</span>
            </h2>
            <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search listings..."
                className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-40" />
              {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-purple-50">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-600 font-medium">Koi listing nahi mili</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="mt-3 text-sm text-purple-600 hover:underline">Reset filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ListingCard item={item} onBook={handleBook} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── OFFBEAT LOCATIONS ── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #7c3aed, #db2777)' }} />
            <h2 className="text-xl font-bold text-gray-800">Hidden Gems & Offbeat Places 💎</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5 ml-3">Less crowded, more authentic — India ke chhupe huye khazane</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offbeatLocations.map((loc, i) => (
              <motion.div key={loc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <OffbeatCard loc={loc} onExplore={setOffbeatItem} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── GUIDE BOOKING SECTION ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Book a Local Guide 🧭</h2>
              <p className="text-xs text-gray-500">Certified, experienced, multilingual — your perfect travel companion</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide, i) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all"
              >
                {/* Guide header */}
                <div className="relative h-32 overflow-hidden">
                  <img src={guide.images[0]} alt={guide.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <img src={guide.avatar} alt={guide.name} className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                    <div>
                      <p className="text-white font-bold text-sm">{guide.name}</p>
                      <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                        {guideTypeLabels[guide.guide_type]}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-semibold">{guide.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 bg-purple-50 rounded-xl p-2">
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-gray-700 font-medium">{guide.experience_years} yrs exp</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-50 rounded-xl p-2">
                      <Languages className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-gray-700 font-medium truncate">{guide.languages.length} languages</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-1 font-medium">Speciality:</p>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{guide.speciality}</p>

                  <div className="flex gap-1 flex-wrap mb-4">
                    {guide.languages.slice(0, 3).map(lang => (
                      <span key={lang} className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full">{lang}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-gray-800">₹{guide.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">/{guide.pricing_type}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleBook(guide)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
                    >
                      <Compass className="w-3.5 h-3.5" /> Book Guide
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
