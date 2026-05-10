'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { destinations } from '@/lib/dummy-data';
import { Sparkles, ChevronRight, Star, Map, List, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { formatCurrencyFull } from '@/lib/utils';
import { indianCities, tripTypes } from '@/lib/dummy-data';

const IndiaMap = dynamic(() => import('@/components/ui/IndiaMap'), { ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center h-72">
      <p className="text-gray-400 text-sm">Map load ho raha hai...</p>
    </div>
  ),
});

const steps = ['Destination', 'Dates & Budget', 'Preferences', 'Review'];

const allPrefs = [
  'Adventure', 'Relaxation', 'Culture & Heritage', 'Street Food',
  'Photography', 'Nightlife', 'Nature & Wildlife', 'Shopping',
  'History', 'Yoga & Wellness', 'Water Sports', 'Family Fun',
  'Pilgrimage', 'Hill Stations', 'Backpacking',
];

export default function PlanPage() {
  const [step, setStep]         = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [destView, setDestView] = useState<'grid' | 'map'>('grid');
  const [prefs, setPrefs]       = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [dateError, setDateError] = useState('');
  const [loading, setLoading]     = useState(false);
  const { tripForm, setTripForm, addChatMessage } = useAppStore();
  const router = useRouter();

  function togglePref(p: string) {
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function validateDates() {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setDateError('End date, start date se pehle nahi ho sakti');
      return false;
    }
    setDateError('');
    return true;
  }

  function handleNext() {
    if (step === 1 && !validateDates()) return;
    if (step < steps.length - 1) { setStep(step + 1); return; }

    // Final step — generate AI itinerary
    setLoading(true);
    const destNames = selected.length > 0
      ? destinations.filter(d => selected.includes(d.id)).map(d => d.name).join(', ')
      : 'India';
    const prompt = [
      `Mujhe ${destNames} ke liye ek detailed trip plan chahiye.`,
      `Duration: ${tripForm.duration} din`,
      `Budget: ${formatCurrencyFull(tripForm.budget[0])} – ${formatCurrencyFull(tripForm.budget[1])} per person`,
      `Travelers: ${tripForm.travelers} log`,
      `Trip Type: ${tripForm.type}`,
      tripForm.source ? `Departure: ${tripForm.source}` : '',
      startDate ? `Start Date: ${startDate}` : '',
      prefs.length > 0 ? `Preferences: ${prefs.join(', ')}` : '',
      `Kripya day-by-day itinerary, hotel suggestions, aur budget breakdown do.`,
    ].filter(Boolean).join('\n');

    addChatMessage({ id: Date.now().toString(), role: 'user', content: prompt, timestamp: new Date() });
    setTimeout(() => { setLoading(false); router.push('/assistant'); }, 800);
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Nayi Trip Plan Karo 🗺️</h1>
          <p className="text-sm text-gray-500 mt-1">AI se banao apna perfect Indian itinerary</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <button onClick={() => i < step && setStep(i)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    i < step ? 'bg-emerald-500 text-white cursor-pointer' : i === step ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-default'}`}
                  style={i === step ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' } : {}}>
                  {i < step ? '✓' : i + 1}
                </button>
                <span className={`text-xs mt-1 font-medium ${i === step ? 'text-purple-600' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-6 shadow-card border border-purple-50 mb-6">

          {/* STEP 0 — Destination */}
          {step === 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">Kahan Jaana Hai? 🇮🇳</h2>
                  <p className="text-sm text-gray-500">Ek ya zyada destinations chuniye</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {[{ id: 'grid', icon: List, label: 'Grid' }, { id: 'map', icon: Map, label: 'Map' }].map(v => (
                    <button key={v.id} onClick={() => setDestView(v.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${destView === v.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}>
                      <v.icon className="w-3.5 h-3.5" />{v.label}
                    </button>
                  ))}
                </div>
              </div>
              {selected.length > 0 && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Selected:</span>
                  {destinations.filter(d => selected.includes(d.id)).map(d => (
                    <span key={d.id} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      {d.name}
                      <button onClick={() => setSelected(p => p.filter(id => id !== d.id))}>×</button>
                    </span>
                  ))}
                </div>
              )}
              {destView === 'map' ? (
                <IndiaMap destinations={destinations} selectedIds={selected} height="420px"
                  onDestinationClick={dest => setSelected(prev =>
                    prev.includes(dest.id) ? prev.filter(id => id !== dest.id) : [...prev, dest.id])} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {destinations.map(dest => (
                    <motion.div key={dest.id} whileHover={{ y: -2 }}
                      onClick={() => setSelected(prev => prev.includes(dest.id) ? prev.filter(id => id !== dest.id) : [...prev, dest.id])}
                      className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selected.includes(dest.id) ? 'border-purple-500 shadow-lg shadow-purple-100' : 'border-transparent'}`}>
                      <div className="relative h-28">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        {selected.includes(dest.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2">
                          <p className="text-white text-xs font-bold leading-tight">{dest.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-white/80 text-xs">{dest.rating}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Dates & Budget */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-bold text-gray-800 text-lg">Dates & Budget 💰</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Kahan Se?</label>
                  <select value={tripForm.source} onChange={e => setTripForm({ source: e.target.value })}
                    className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-500">
                    <option value="">Shehar chuniye</option>
                    {indianCities.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Trip Type</label>
                  <select value={tripForm.type} onChange={e => setTripForm({ type: e.target.value })}
                    className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-500">
                    {tripTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Start Date</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDateError(''); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">End Date</label>
                  <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setDateError(''); }}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-500" />
                </div>
                {dateError && <p className="col-span-2 text-xs text-red-500">{dateError}</p>}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Budget per person: <span className="text-purple-600">{formatCurrencyFull(tripForm.budget[1])}</span>
                  </label>
                  <input type="range" min={2000} max={200000} step={1000} value={tripForm.budget[1]}
                    onChange={e => setTripForm({ budget: [tripForm.budget[0], Number(e.target.value)] })}
                    className="w-full accent-purple-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹2,000</span><span>₹2,00,000</span></div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Kitne Log?</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setTripForm({ travelers: Math.max(1, tripForm.travelers - 1) })}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors text-lg">−</button>
                    <span className="text-2xl font-bold text-gray-800 w-8 text-center">{tripForm.travelers}</span>
                    <button onClick={() => setTripForm({ travelers: Math.min(20, tripForm.travelers + 1) })}
                      className="w-10 h-10 rounded-xl bg-purple-100 hover:bg-purple-200 font-bold text-purple-600 transition-colors text-lg">+</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Preferences */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-2">Aapki Preferences 🎯</h2>
              <p className="text-sm text-gray-500 mb-5">Jo cheezein aapko pasand hain woh chuniye ({prefs.length} selected)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allPrefs.map(pref => (
                  <button key={pref} onClick={() => togglePref(pref)}
                    className={`py-3 px-4 rounded-2xl border-2 text-sm font-medium transition-all text-left flex items-center justify-between ${
                      prefs.includes(pref)
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                        : 'border-purple-100 text-gray-600 hover:border-purple-300 hover:bg-purple-50'}`}>
                    {pref}
                    {prefs.includes(pref) && <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-5">Trip Review Karo ✅</h2>
              <div className="rounded-2xl p-5 space-y-3" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(219,39,119,0.05))' }}>
                {[
                  { label: 'Destinations', value: selected.length > 0 ? destinations.filter(d => selected.includes(d.id)).map(d => d.name).join(', ') : 'Koi select nahi kiya (AI choose karega)' },
                  { label: 'Duration',     value: `${tripForm.duration} din` },
                  { label: 'Dates',        value: startDate ? `${startDate} → ${endDate || '?'}` : 'Select nahi kiya' },
                  { label: 'Budget',       value: `${formatCurrencyFull(tripForm.budget[0])} – ${formatCurrencyFull(tripForm.budget[1])} per person` },
                  { label: 'Travelers',    value: `${tripForm.travelers} log` },
                  { label: 'Trip Type',    value: tripForm.type },
                  { label: 'Departure',    value: tripForm.source || 'Select nahi kiya' },
                  { label: 'Preferences', value: prefs.length > 0 ? prefs.join(', ') : 'Koi nahi' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-start py-1 border-b border-purple-100 last:border-0 gap-4">
                    <span className="text-sm text-gray-500 flex-shrink-0">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-800 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700">AI aapki preferences ke hisaab se ek personalized Indian itinerary banayega aur chat mein bhejega! 🇮🇳</p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="px-5 py-2.5 bg-white border border-purple-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors disabled:opacity-40">
            Peeche
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleNext} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : step === steps.length - 1 ? (
              <><Sparkles className="w-4 h-4" /> AI Se Generate Karo 🚀</>
            ) : (
              <>Aage <ChevronRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      </div>
    </AppLayout>
  );
}
