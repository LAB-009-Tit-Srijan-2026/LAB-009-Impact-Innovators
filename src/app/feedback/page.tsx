'use client';
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSearchParams, useRouter } from 'next/navigation';
import { StarRating } from '@/components/ui/StarRating';
import {
  Shield, IndianRupee, Backpack, Home, MapPin,
  CheckCircle2, Loader2, Sparkles, MessageSquare, ThumbsUp
} from 'lucide-react';

const RATING_PARAMS = [
  { key: 'safety_rating',        label: 'Safety',        emoji: '🛡️', icon: Shield,       desc: 'Kitna safe tha experience?' },
  { key: 'budget_rating',        label: 'Budget Friendly',emoji: '💰', icon: IndianRupee,  desc: 'Value for money kaisa tha?' },
  { key: 'experience_rating',    label: 'Experience',    emoji: '🎒', icon: Backpack,      desc: 'Overall experience kaisa raha?' },
  { key: 'accommodation_rating', label: 'Accommodation', emoji: '🏡', icon: Home,          desc: 'Stay / service quality kaisi thi?' },
  { key: 'location_rating',      label: 'Location / Spot',emoji: '📍', icon: MapPin,       desc: 'Location aur surroundings kaisi thi?' },
] as const;

type RatingKey = typeof RATING_PARAMS[number]['key'];

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const bookingId    = searchParams.get('bookingId') ?? '';
  const listingId    = searchParams.get('listingId') ?? '';
  const listingTitle = searchParams.get('title') ?? 'Your Experience';

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    safety_rating: 0, budget_rating: 0, experience_rating: 0,
    accommodation_rating: 0, location_rating: 0,
  });
  const [comment, setComment]           = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState('');

  const allRated   = Object.values(ratings).every(v => v > 0);
  const overallAvg = allRated
    ? Math.round(Object.values(ratings).reduce((s, v) => s + v, 0) / 5 * 10) / 10
    : 0;

  function setRating(key: RatingKey, val: number) {
    setRatings(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allRated) { setError('Sabhi 5 categories ko rate karo'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/explore/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo', bookingId, listingId,
          ...ratings, comment, would_recommend: wouldRecommend,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      setDone(true);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          🙏
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Shukriya! 🎉</h2>
        <p className="text-gray-500 mb-2">Aapka feedback submit ho gaya</p>
        <div className="flex items-center justify-center gap-1 mb-6">
          {[1,2,3,4,5].map(s => (
            <span key={s} className={`text-2xl ${s <= Math.round(overallAvg) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
          ))}
          <span className="text-lg font-bold text-gray-700 ml-2">{overallAvg}/5</span>
        </div>
        <p className="text-sm text-gray-400 mb-8">Aapka feedback doosre travelers ki madad karega 🇮🇳</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push('/explore-local')}
            className="px-6 py-3 text-white rounded-2xl font-semibold text-sm shadow-lg flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <Sparkles className="w-4 h-4" /> Explore More
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white border border-purple-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-purple-50 transition-colors">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Post-Trip Feedback</p>
          <h1 className="text-2xl font-extrabold text-white mb-1">Rate Your Experience ⭐</h1>
          <p className="text-white/80 text-sm line-clamp-1">{listingTitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating cards */}
        {RATING_PARAMS.map((param, i) => (
          <motion.div key={param.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
              ratings[param.key] > 0 ? 'border-purple-200 shadow-md' : 'border-purple-50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-purple-50 flex-shrink-0">
                  {param.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{param.label}</p>
                  <p className="text-xs text-gray-400">{param.desc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StarRating value={ratings[param.key]} onChange={v => setRating(param.key, v)} size="lg" />
                {ratings[param.key] > 0 && (
                  <span className="text-xs font-semibold text-purple-600">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][ratings[param.key]]}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Overall preview */}
        {allRated && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-amber-800">Overall Rating</p>
              <p className="text-xs text-amber-600">Average of all 5 categories</p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(overallAvg)} size="md" />
              <span className="text-2xl font-extrabold text-amber-600">{overallAvg}</span>
            </div>
          </motion.div>
        )}

        {/* Would recommend */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-purple-500" /> Kya aap recommend karenge?
          </p>
          <div className="flex gap-3">
            {[{ val: true, label: '👍 Haan, zaroor!', color: 'emerald' }, { val: false, label: '👎 Nahi', color: 'red' }].map(opt => (
              <button key={String(opt.val)} type="button"
                onClick={() => setWouldRecommend(opt.val)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  wouldRecommend === opt.val
                    ? opt.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <label className="font-bold text-gray-800 mb-3 flex items-center gap-2 block">
            <MessageSquare className="w-4 h-4 text-purple-500" /> Apna experience likhiye
            <span className="text-xs text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
            placeholder="Kya achha laga? Kya improve ho sakta hai? Doosre travelers ke liye tips..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-all" />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span>⚠️</span>{error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button type="submit" disabled={loading || !allRated}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full py-4 text-white font-bold rounded-2xl text-base shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            : <><CheckCircle2 className="w-5 h-5" /> Submit Feedback</>}
        </motion.button>

        {!allRated && (
          <p className="text-center text-xs text-gray-400">Sabhi 5 categories ko rate karo phir submit karo</p>
        )}
      </form>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
        <FeedbackContent />
      </Suspense>
    </AppLayout>
  );
}
