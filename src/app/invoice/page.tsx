'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRewardsStore } from '@/store/useRewardsStore';
import { useBookingsStore } from '@/store/useBookingsStore';
import { useAppStore } from '@/store/useAppStore';
import { listings, guides } from '@/lib/explore-local-data';
import {
  Receipt, Tag, Users, IndianRupee, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, Ticket, Sparkles, X, Plus, Minus,
  CreditCard, Wallet, Banknote, Smartphone, MapPin, Calendar
} from 'lucide-react';

import { StarRating } from '@/components/ui/StarRating';

// ─── INVOICE CONTENT ──────────────────────────────────────────────────────────
function InvoiceContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { discount_percentage, user_tier, addTrip } = useRewardsStore();
  const { addBooking } = useBookingsStore();
  const { user, addNotification } = useAppStore();

  // From URL params (set by BookingModal before navigating here)
  const listingId    = searchParams.get('listingId') ?? '';
  const listingTitle = searchParams.get('title') ?? 'Booking';
  const listingCat   = searchParams.get('category') ?? 'stay';
  const listingLoc   = searchParams.get('location') ?? '';
  const price        = Number(searchParams.get('price') ?? 0);
  const date         = searchParams.get('date') ?? '';
  const payMethod    = (searchParams.get('pay') ?? 'upi') as any;
  const note         = searchParams.get('note') ?? '';

  const [travelers, setTravelers]   = useState<string[]>(['You']);
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg]   = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [paying, setPaying]         = useState(false);
  const [paid, setPaid]             = useState(false);
  const [bookingId, setBookingId]   = useState('');
  const [suggestion, setSuggestion] = useState('');

  // Rewards discount
  const isGolden = user_tier === 'Golden';
  const rewardsDisc = ['food', 'stay'].includes(listingCat) && isGolden ? 25
    : price >= 5000 ? discount_percentage : 0;

  const totalDiscPct    = Math.min(rewardsDisc + couponDiscount, 50);
  const discountAmount  = Math.round(price * totalDiscPct / 100);
  const finalPrice      = price - discountAmount;
  const splitCount      = travelers.length;
  const perPerson       = Math.ceil(finalPrice / splitCount);

  // Load suggestion on mount
  useEffect(() => {
    fetch('/api/explore/coupon')
      .then(r => r.json())
      .then(j => {
        const first5 = j.data?.find((c: any) => c.code === 'FIRST5');
        if (first5 && !couponCode) setSuggestion('Apply FIRST5 to save 5% on your first booking! ��');
      })
      .catch(() => {});
  }, []);

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/explore/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, userId: 'demo', amount: price }),
      });
      const json = await res.json();
      setCouponMsg(json.message);
      setCouponValid(json.valid);
      setCouponDiscount(json.valid ? json.discount_pct : 0);
      if (json.valid) setSuggestion('');
    } finally {
      setLoading(false);
    }
  }

  function addTraveler() {
    if (travelers.length >= 10) return;
    setTravelers(prev => [...prev, `Traveler ${prev.length + 1}`]);
  }
  function removeTraveler(i: number) {
    if (travelers.length <= 1) return;
    setTravelers(prev => prev.filter((_, idx) => idx !== i));
  }
  function updateName(i: number, val: string) {
    setTravelers(prev => prev.map((n, idx) => idx === i ? val : n));
  }

  async function handlePay() {
    setPaying(true);
    try {
      // Find listing image
      const allListings = [...listings, ...guides] as any[];
      const listing = allListings.find(l => l.id === listingId);
      const listingImage = listing?.images?.[0] ?? '';

      // Save to localStorage store (persists across reloads)
      const booking = addBooking({
        userId:          user?.id ?? 'demo',
        listingId,
        listingTitle,
        listingCategory: listingCat,
        listingLocation: listingLoc,
        listingImage,
        date,
        note,
        travelers,
        splitCount:      travelers.length,
        perPerson,
        originalPrice:   price,
        discountPct:     totalDiscPct,
        couponCode:      couponValid ? couponCode : null,
        finalPrice,
        paymentMethod:   payMethod,
        status:          'confirmed',
      });

      // Also call backend API (best-effort, not critical)
      fetch('/api/explore/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? 'demo', listingId, date, note,
          paymentMethod: payMethod, discountPct: totalDiscPct,
          couponCode: couponValid ? couponCode : undefined, travelers,
        }),
      }).catch(() => {}); // ignore if server is cold

      // Update rewards (simulate 200km trip)
      addTrip({
        destination: listingLoc || listingTitle,
        distance: 150 + Math.floor(Math.random() * 200),
        total_amount: finalPrice,
        completed: true,
      });

      setBookingId(booking.id);

      // Push notification to bell icon
      addNotification({
        message: `✅ Booking confirmed! ${listingTitle} — ${date} · Ref: ${booking.id.slice(-6).toUpperCase()}`,
        type: 'booking',
      });

      setPaid(true);
    } catch (e: any) {
      alert('Booking failed: ' + e.message);
    } finally {
      setPaying(false);
    }
  }

  const catEmoji: Record<string, string> = {
    stay: '🏡', food: '🍛', experience: '🎒', transport: '🚗', guide: '🧭', shop: '🛍️',
  };
  const payIcons: Record<string, any> = {
    upi: Smartphone, card: CreditCard, wallet: Wallet, cash: Banknote,
  };
  const PayIcon = payIcons[payMethod] ?? Smartphone;

  if (paid) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          ✅
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Payment Successful! 🎉</h2>
        <p className="text-gray-500 mb-1">Booking confirmed</p>
        <p className="text-xs text-gray-400 mb-2">Ref: <span className="font-mono font-bold text-purple-600">{bookingId}</span></p>
        <p className="text-sm text-gray-500 mb-8">Confirmation aapke email pe bhej di gayi hai</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => router.push(`/feedback?bookingId=${bookingId}&listingId=${listingId}&title=${encodeURIComponent(listingTitle)}`)}
            className="px-6 py-3 text-white rounded-2xl font-semibold text-sm shadow-lg flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <Sparkles className="w-4 h-4" /> Rate Your Experience
          </button>
          <button onClick={() => router.push('/my-bookings')}
            className="px-6 py-3 bg-white border border-purple-200 text-purple-700 rounded-2xl font-semibold text-sm hover:bg-purple-50 transition-colors">
            📋 My Bookings
          </button>
          <button onClick={() => router.push('/explore-local')}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Invoice & Payment Summary</h1>
          <p className="text-sm text-gray-500">Review before paying</p>
        </div>
      </div>

      {/* Suggestion banner */}
      <AnimatePresence>
        {suggestion && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Ticket className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">{suggestion}</p>
            <button onClick={() => { setCouponCode('FIRST5'); setSuggestion(''); }}
              className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl hover:bg-amber-200 transition-colors">
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Details */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">{catEmoji[listingCat] ?? '📋'}</span> Booking Details
        </h2>
        <div className="space-y-2.5">
          {[
            { label: 'Service',  value: listingTitle },
            { label: 'Category', value: listingCat.charAt(0).toUpperCase() + listingCat.slice(1) },
            { label: 'Location', value: listingLoc, icon: MapPin },
            { label: 'Date',     value: date, icon: Calendar },
            { label: 'Payment',  value: payMethod.toUpperCase(), icon: PayIcon },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{row.label}</span>
              <span className="text-sm font-semibold text-gray-800">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Split */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" /> Expense Split
          </h2>
          <button onClick={addTraveler} disabled={travelers.length >= 10}
            className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-40">
            <Plus className="w-3 h-3" /> Add Traveler
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {travelers.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={name} onChange={e => updateName(i, e.target.value)}
                className="flex-1 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-400" />
              <span className="text-sm font-bold text-emerald-600 w-20 text-right">₹{perPerson.toLocaleString()}</span>
              {travelers.length > 1 && (
                <button onClick={() => removeTraveler(i)} className="w-7 h-7 flex items-center justify-center bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Minus className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
        {splitCount > 1 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
            <p className="text-sm font-bold text-emerald-700">
              ₹{finalPrice.toLocaleString()} ÷ {splitCount} = <span className="text-lg">₹{perPerson.toLocaleString()}</span> per person
            </p>
          </div>
        )}
      </div>

      {/* Coupon */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-pink-500" /> Coupon / Promo Code
        </h2>
        <div className="flex gap-2">
          <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(''); setCouponValid(false); setCouponDiscount(0); }}
            placeholder="Enter coupon code"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 uppercase tracking-widest font-mono" />
          <button onClick={validateCoupon} disabled={!couponCode.trim() || loading}
            className="px-4 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </button>
        </div>
        <AnimatePresence>
          {couponMsg && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`text-xs mt-2 flex items-center gap-1.5 ${couponValid ? 'text-emerald-600' : 'text-red-500'}`}>
              {couponValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {couponMsg}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-3 flex flex-wrap gap-2">
          {['FIRST5', 'INDIA15', 'SAVE20'].map(code => (
            <button key={code} onClick={() => { setCouponCode(code); setCouponMsg(''); setCouponValid(false); setCouponDiscount(0); }}
              className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full font-mono hover:bg-purple-100 transition-colors">
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Breakdown */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-500" /> Price Breakdown
        </h2>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Original Price</span>
            <span className="font-semibold text-gray-800">₹{price.toLocaleString()}</span>
          </div>
          {rewardsDisc > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600 flex items-center gap-1">
                {isGolden ? '👑 Golden Discount' : '🎁 Rewards Discount'} ({rewardsDisc}%)
              </span>
              <span className="font-semibold text-emerald-600">−₹{Math.round(price * rewardsDisc / 100).toLocaleString()}</span>
            </div>
          )}
          {couponValid && couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-pink-600 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon ({couponCode}) {couponDiscount}%
              </span>
              <span className="font-semibold text-pink-600">−₹{Math.round(price * couponDiscount / 100).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="font-bold text-gray-800">Total Payable</span>
            <span className="text-xl font-extrabold text-purple-600">₹{finalPrice.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <p className="text-xs text-emerald-600 text-right font-medium">
              🎉 You save ₹{discountAmount.toLocaleString()} ({totalDiscPct}% off)
            </p>
          )}
          {splitCount > 1 && (
            <div className="bg-purple-50 rounded-xl p-2.5 flex justify-between text-sm">
              <span className="text-purple-600 font-medium">Per Person ({splitCount} travelers)</span>
              <span className="font-bold text-purple-700">₹{perPerson.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pay button */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={handlePay} disabled={paying}
        className="w-full py-4 text-white font-bold rounded-2xl text-base shadow-xl disabled:opacity-60 flex items-center justify-center gap-3"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
        {paying
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
          : <><PayIcon className="w-5 h-5" /> Pay ₹{finalPrice.toLocaleString()} via {payMethod.toUpperCase()} <ArrowRight className="w-5 h-5" /></>}
      </motion.button>
      <p className="text-center text-xs text-gray-400">🔒 Secure payment · 100% refund on cancellation within 24 hours</p>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
        <InvoiceContent />
      </Suspense>
    </AppLayout>
  );
}
