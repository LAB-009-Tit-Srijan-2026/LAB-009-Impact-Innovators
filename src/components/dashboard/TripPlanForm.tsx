'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Sparkles, ChevronDown, Navigation } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { indianCities, tripTypes, destinations } from '@/lib/dummy-data';
import { formatCurrencyFull } from '@/lib/utils';

export function TripPlanForm() {
  const { tripForm, setTripForm, addChatMessage } = useAppStore();
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    const prompt = [
      tripForm.destination
        ? `${tripForm.destination} ke liye ek detailed trip plan banao.`
        : 'India mein ek best trip destination suggest karo aur plan banao.',
      `Duration: ${tripForm.duration} din`,
      `Budget: ₹${tripForm.budget[0].toLocaleString()} – ₹${tripForm.budget[1].toLocaleString()} per person`,
      `Travelers: ${tripForm.travelers} log`,
      `Trip Type: ${tripForm.type}`,
      tripForm.source ? `Departure City: ${tripForm.source}` : '',
      'Kripya day-by-day itinerary, top hotels, must-try food, aur budget breakdown do.',
    ].filter(Boolean).join('\n');

    addChatMessage({ id: Date.now().toString(), role: 'user', content: prompt, timestamp: new Date() });
    router.push('/assistant');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-purple-100">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">AI Trip Planner</h2>
          <p className="text-xs text-gray-400">Seconds mein perfect itinerary ready!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Source */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Kahan Se?</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <select value={tripForm.source} onChange={(e) => setTripForm({ source: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 appearance-none">
              <option value="">Shehar chuniye</option>
              {indianCities.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Kahan Jaana Hai?</label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <select value={tripForm.destination} onChange={(e) => setTripForm({ destination: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 bg-pink-50 border border-pink-200 rounded-xl text-sm text-gray-700 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 appearance-none">
              <option value="">Destination chuniye (optional)</option>
              {destinations.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Trip type */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Trip Ka Type</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🎒</span>
            <select value={tripForm.type} onChange={(e) => setTripForm({ type: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 appearance-none">
              {tripTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Kitne Din: <span className="text-purple-600">{tripForm.duration} din</span>
          </label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <input type="range" min={1} max={30} value={tripForm.duration}
              onChange={(e) => setTripForm({ duration: Number(e.target.value) })}
              className="w-full accent-purple-600" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 din</span><span>30 din</span></div>
        </div>

        {/* Budget */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Budget: <span className="text-purple-600">{formatCurrencyFull(tripForm.budget[1])}</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold text-sm flex-shrink-0">₹</span>
            <input type="range" min={2000} max={200000} step={1000} value={tripForm.budget[1]}
              onChange={(e) => setTripForm({ budget: [tripForm.budget[0], Number(e.target.value)] })}
              className="w-full accent-purple-600" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹2K</span><span>₹2L</span></div>
        </div>

        {/* Travelers */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Kitne Log?</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setTripForm({ travelers: Math.max(1, tripForm.travelers - 1) })}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 transition-colors text-lg">−</button>
            <div className="flex-1 text-center bg-purple-50 rounded-xl py-2">
              <span className="text-lg font-bold text-purple-700">{tripForm.travelers}</span>
              <p className="text-xs text-gray-400">log</p>
            </div>
            <button onClick={() => setTripForm({ travelers: Math.min(20, tripForm.travelers + 1) })}
              className="w-9 h-9 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center font-bold text-purple-600 transition-colors text-lg">+</button>
          </div>
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={handlePlan} disabled={loading}
        className="mt-5 w-full font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 text-white"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }}>
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI Itinerary Bana Raha Hai...</>
        ) : (
          <><Sparkles className="w-4 h-4" />AI Se Trip Plan Karo 🚀</>
        )}
      </motion.button>
    </div>
  );
}
