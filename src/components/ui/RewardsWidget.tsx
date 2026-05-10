'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '@/store/useRewardsStore';
import {
  Trophy, Zap, MapPin, TrendingUp, Star, Gift,
  ChevronRight, Plus, Crown, Sparkles, Route
} from 'lucide-react';

// ─── GOLDEN BADGE ──────────────────────────────────────────────────────────────
export function GoldenBadge({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
  return (
    <motion.span
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`inline-flex items-center gap-1 font-bold rounded-full ${sizes[size]}`}
      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}
    >
      <Crown className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      Golden Traveler ✨
    </motion.span>
  );
}

// ─── DISCOUNT BADGE on listing cards ──────────────────────────────────────────
export function DiscountBadge({ category, price }: { category: string; price: number }) {
  const { discount_percentage, user_tier } = useRewardsStore();
  const goldenCats = ['food', 'stay'];
  const isGoldenEligible = user_tier === 'Golden' && goldenCats.includes(category);
  const pct = isGoldenEligible ? 25 : discount_percentage;

  if (pct === 0 || price < 5000) return null;

  const saved = Math.round(price * pct / 100);
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute bottom-3 right-3 z-10"
    >
      <span className={`text-xs font-bold px-2 py-1 rounded-full text-white shadow-lg ${
        isGoldenEligible
          ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
      }`}>
        {pct}% OFF · Save ₹{saved.toLocaleString()}
      </span>
    </motion.div>
  );
}

// ─── REWARDS WIDGET (dashboard / explore-local) ────────────────────────────────
export function RewardsWidget({ compact = false }: { compact?: boolean }) {
  const {
    total_distance_travelled, total_trips, reward_points,
    discount_percentage, user_tier, addTrip,
  } = useRewardsStore();

  const [showSimulator, setShowSimulator] = useState(false);
  const [simDist, setSimDist]             = useState(150);
  const [simAmt, setSimAmt]               = useState(12000);
  const [simResult, setSimResult]         = useState<any>(null);

  const isGolden       = user_tier === 'Golden';
  const kmToGolden     = Math.max(0, 1000 - total_distance_travelled);
  const progressToGold = Math.min(100, (total_distance_travelled / 1000) * 100);

  function handleSimulate() {
    const result = addTrip({
      destination: 'Simulated Trip',
      distance: simDist,
      total_amount: simAmt,
      completed: true,
    });
    setSimResult(result);
  }

  if (compact) {
    return (
      <div className={`rounded-2xl p-4 border ${isGolden ? 'border-amber-200' : 'border-purple-100'}`}
        style={{ background: isGolden
          ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))'
          : 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(219,39,119,0.04))' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isGolden ? 'bg-amber-100' : 'bg-purple-100'}`}>
              <Trophy className={`w-4 h-4 ${isGolden ? 'text-amber-600' : 'text-purple-600'}`} />
            </div>
            <span className="text-sm font-bold text-gray-800">Your Travel Rewards</span>
          </div>
          {isGolden ? <GoldenBadge size="sm" /> : (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Normal</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-extrabold text-gray-800">{total_distance_travelled.toLocaleString()}</p>
            <p className="text-xs text-gray-500">km travelled</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-800">{total_trips}</p>
            <p className="text-xs text-gray-500">trips done</p>
          </div>
          <div>
            <p className={`text-lg font-extrabold ${isGolden ? 'text-amber-600' : 'text-emerald-600'}`}>{discount_percentage}%</p>
            <p className="text-xs text-gray-500">discount</p>
          </div>
        </div>
        {!isGolden && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to Golden ✨</span>
              <span>{kmToGolden} km left</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressToGold}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full widget
  return (
    <div className={`rounded-3xl overflow-hidden border ${isGolden ? 'border-amber-200' : 'border-purple-100'} shadow-sm`}>
      {/* Header */}
      <div className={`p-5 ${isGolden
        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
        : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-base">Your Travel Rewards</h3>
          </div>
          {isGolden
            ? <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1"><Crown className="w-3 h-3" /> Golden ✨</span>
            : <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">Normal Tier</span>}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Distance', value: `${total_distance_travelled.toLocaleString()} km`, icon: Route },
            { label: 'Trips',    value: total_trips.toString(),                             icon: MapPin },
            { label: 'Points',   value: reward_points.toLocaleString(),                    icon: Star  },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
              <Icon className="w-4 h-4 text-white/80 mx-auto mb-1" />
              <p className="text-white font-extrabold text-lg leading-none">{value}</p>
              <p className="text-white/70 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 space-y-4">
        {/* Golden unlock message */}
        {isGolden ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <span className="text-2xl flex-shrink-0">👑</span>
            <div>
              <p className="text-sm font-bold text-amber-800">You unlocked Golden Status!</p>
              <p className="text-xs text-amber-700 mt-0.5">Enjoy <strong>25% OFF</strong> on all stays & food bookings above ₹5,000</p>
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-medium">Progress to Golden ✨</span>
              <span className="font-semibold text-amber-600">{kmToGolden} km left</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 relative"
                initial={{ width: 0 }}
                animate={{ width: `${progressToGold}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <span className="absolute right-1 top-0 bottom-0 flex items-center">
                  <span className="text-xs">✨</span>
                </span>
              </motion.div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Travel {kmToGolden} more km to unlock 25% discount on stays & food</p>
          </div>
        )}

        {/* Current discount */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-gray-800">Current Discount</p>
              <p className="text-xs text-gray-500">On bookings above ₹5,000</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-600">{discount_percentage}%</span>
        </div>

        {/* How to earn more */}
        <div className="bg-purple-50 rounded-2xl p-3">
          <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Travel more, save more 🚀
          </p>
          <div className="space-y-1.5">
            {[
              { text: 'Complete a trip ≥ 100 km', reward: '+5% discount' },
              { text: 'Reach 1,000 km total',     reward: 'Golden Status ✨' },
              { text: 'Every km travelled',        reward: '+2 reward points' },
            ].map(item => (
              <div key={item.text} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-purple-400" />{item.text}</span>
                <span className="font-semibold text-purple-600">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trip simulator */}
        <div>
          <button
            onClick={() => setShowSimulator(p => !p)}
            className="w-full flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
          >
            <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Simulate a trip & earn rewards</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showSimulator ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showSimulator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 bg-gray-50 rounded-2xl p-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Trip Distance (km)</label>
                    <input type="number" value={simDist} onChange={e => setSimDist(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Booking Amount (₹)</label>
                    <input type="number" value={simAmt} onChange={e => setSimAmt(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400" />
                  </div>
                  <button onClick={handleSimulate}
                    className="w-full py-2 text-white text-xs font-semibold rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                    Complete Trip & Earn Rewards
                  </button>
                  {simResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                      <p className="font-semibold text-emerald-800">🎉 Rewards Earned!</p>
                      {simResult.discountGained > 0 && <p className="text-emerald-700">+{simResult.discountGained}% discount unlocked</p>}
                      {simResult.newTier === 'Golden' && <p className="text-amber-700 font-bold">👑 Golden Status Unlocked!</p>}
                      <p className="text-gray-600">+{simDist * 2} reward points added</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── SAVINGS BANNER ────────────────────────────────────────────────────────────
export function SavingsBanner() {
  const { discount_percentage, user_tier, total_distance_travelled } = useRewardsStore();
  const isGolden = user_tier === 'Golden';

  if (discount_percentage === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 flex items-center gap-3 ${
        isGolden
          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
          : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
      }`}
    >
      <span className="text-2xl flex-shrink-0">{isGolden ? '👑' : '🎁'}</span>
      <div className="flex-1">
        {isGolden ? (
          <>
            <p className="text-sm font-bold text-amber-800">Golden Traveler — 25% OFF on Stays & Food! ✨</p>
            <p className="text-xs text-amber-700">You've travelled {total_distance_travelled.toLocaleString()} km — enjoy exclusive Golden benefits</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-emerald-800">You get {discount_percentage}% OFF on bookings above ₹5,000! 🚀</p>
            <p className="text-xs text-emerald-700">Travel more to unlock higher discounts — {Math.max(0, 1000 - total_distance_travelled)} km to Golden Status</p>
          </>
        )}
      </div>
      <span className={`text-xl font-extrabold flex-shrink-0 ${isGolden ? 'text-amber-600' : 'text-emerald-600'}`}>
        {isGolden ? '25%' : `${discount_percentage}%`}
      </span>
    </motion.div>
  );
}
