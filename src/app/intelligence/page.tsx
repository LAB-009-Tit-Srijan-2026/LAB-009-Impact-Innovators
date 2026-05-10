'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  calculatePopularityRanking, getTopStates, getCategoryDistribution,
  predictFuturePopularity, generateHeatmapData,
} from '@/lib/intelligence-data';
import type { PredictionResult } from '@/lib/intelligence-data';
import {
  TrendingUp, Map, BarChart2, Flame, Star, MapPin,
  Eye, Users, Sparkles, ArrowUp, ArrowDown, Minus,
  Trophy, Compass, Filter, Search, X
} from 'lucide-react';
import { destinations } from '@/lib/dummy-data';

const IndiaMap = dynamic(() => import('@/components/ui/IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center" style={{ height: '480px' }}>
      <p className="text-gray-400 text-sm">Map load ho raha hai...</p>
    </div>
  ),
});

const TABS = [
  { id: 'heatmap',    label: 'Density Map',    emoji: '🗺️' },
  { id: 'analytics',  label: 'Analytics',      emoji: '📊' },
  { id: 'prediction', label: 'AI Predictions', emoji: '🔮' },
];

// ─── PREDICTION CARD ──────────────────────────────────────────────────────────
function PredictionCard({ place, rank }: { place: PredictionResult; rank: number }) {
  const trendColor = place.trend_tag === '🔥 Rising' ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : place.trend_tag === '📉 Declining' ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-gray-600 bg-gray-50 border-gray-200';
  const TrendIcon = place.trend_tag === '🔥 Rising' ? ArrowUp
    : place.trend_tag === '📉 Declining' ? ArrowDown : Minus;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all">
      <div className="relative h-36 overflow-hidden">
        <img src={place.image} alt={place.place_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          #{rank}
        </div>
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full border ${trendColor} flex items-center gap-1`}>
          <TrendIcon className="w-3 h-3" />{place.trend_tag}
        </span>
        {place.is_offbeat && (
          <span className="absolute bottom-10 left-3 text-xs bg-amber-400/90 text-white px-2 py-0.5 rounded-full font-medium">
            �� Offbeat
          </span>
        )}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-sm">{place.place_name}</p>
          <p className="text-white/70 text-xs">{place.state}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">Current</p>
            <p className="text-lg font-extrabold text-gray-800">{place.popularity_score}</p>
          </div>
          <div className="flex-1 mx-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${place.popularity_score}%` }}
                transition={{ duration: 0.8 }} className="h-full rounded-full bg-gray-300" />
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
              <motion.div initial={{ width: 0 }} animate={{ width: `${place.predicted_score}%` }}
                transition={{ duration: 0.8, delay: 0.2 }} className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #db2777)' }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Predicted</p>
            <p className="text-lg font-extrabold text-purple-600">{place.predicted_score}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 italic">{place.insight}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{place.category}</span>
          <span className="text-xs text-gray-400">Growth factor: {place.growth_factor}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function IntelligencePage() {
  const [activeTab, setActiveTab]   = useState('heatmap');
  const [predFilter, setPredFilter] = useState<'all' | 'rising' | 'offbeat'>('all');
  const [search, setSearch]         = useState('');

  const topStates      = useMemo(() => getTopStates(), []);
  const categories     = useMemo(() => getCategoryDistribution(), []);
  const ranked         = useMemo(() => calculatePopularityRanking(), []);
  const predictions    = useMemo(() => predictFuturePopularity(), []);

  const filteredPreds = predictions.filter(p => {
    const matchFilter = predFilter === 'all' ? true
      : predFilter === 'rising'  ? p.trend_tag === '🔥 Rising'
      : p.is_offbeat;
    const matchSearch = !search || p.place_name.toLowerCase().includes(search.toLowerCase())
      || p.state.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const risingCount   = predictions.filter(p => p.trend_tag === '🔥 Rising').length;
  const offbeatRising = predictions.filter(p => p.is_offbeat && p.trend_tag === '🔥 Rising').length;
  const avgPredicted  = Math.round(predictions.reduce((s, p) => s + p.predicted_score, 0) / predictions.length);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl p-7"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #db2777 100%)' }}>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                className="absolute w-40 h-40 bg-white/5 rounded-full blur-2xl"
                style={{ left: `${5 + i * 20}%`, top: `${10 + (i % 3) * 25}%` }} />
            ))}
          </div>
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                  🧠 AI Data Intelligence Layer
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-1">Tourism Intelligence 🔮</h1>
              <p className="text-white/75 text-sm max-w-lg">
                Live heatmaps, analytics, aur AI-powered predictions — India ke tourism trends ek jagah
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Places Tracked', value: '30', icon: MapPin },
                { label: 'Rising Spots',   value: risingCount.toString(), icon: TrendingUp },
                { label: 'Offbeat Rising', value: offbeatRising.toString(), icon: Compass },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
                  <Icon className="w-4 h-4 text-white/80 mx-auto mb-1" />
                  <p className="text-white font-extrabold text-xl leading-none">{value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-purple-50 rounded-2xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* HEATMAP TAB */}
        {activeTab === 'heatmap' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-800">Tourist Density Heatmap 🗺️</h2>
                <span className="text-xs text-gray-500 ml-1">— Toggle between Markers and Heatmap view</span>
              </div>
              <IndiaMap destinations={destinations} height="520px" showHeatmapToggle={true} />
            </div>

            {/* Top 5 density spots */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Highest Tourist Density Spots
              </h3>
              <div className="space-y-3">
                {generateHeatmapData().sort((a, b) => b.intensity - a.intensity).slice(0, 8).map((pt, i) => (
                  <div key={pt.place_name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `rgba(${Math.round(pt.intensity * 239)}, ${Math.round((1 - pt.intensity) * 100 + 50)}, ${Math.round((1 - pt.intensity) * 200)}, 0.9)` }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{pt.place_name}</span>
                        <span className="text-xs font-bold text-purple-600">{pt.visitors_count.toLocaleString()}K/yr</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pt.intensity * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, rgba(0,100,200,0.6), rgba(239,68,68,0.9))` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">

            {/* Top States Bar Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">Top States by Tourism Volume</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStates.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}K`} />
                  <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v: any) => [`${v.toLocaleString()}K visitors`, 'Annual Visitors']} />
                  <Bar dataKey="total_visitors" radius={[0, 6, 6, 0]}>
                    {topStates.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={`hsl(${260 + i * 15}, 70%, ${55 + i * 3}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie + Top 10 list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie chart */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <h2 className="text-lg font-bold text-gray-800 mb-5">Most Popular Categories</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" outerRadius={90} dataKey="total_visitors"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {categories.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v.toLocaleString()}K`, 'Visitors']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map(c => (
                    <div key={c.category} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-xs text-gray-600">{c.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 10 ranked list */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <h2 className="text-lg font-bold text-gray-800 mb-5">Top 10 Places by Popularity</h2>
                <div className="space-y-2.5">
                  {ranked.slice(0, 10).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-purple-50 text-purple-500'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-sm font-medium text-gray-700 truncate">{p.place_name}</span>
                          <span className="text-xs font-bold text-purple-600 flex-shrink-0 ml-2">{p.popularity_score}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${p.popularity_score}%` }}
                            transition={{ duration: 0.6, delay: i * 0.04 }} className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #7c3aed, #db2777)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Least explored */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <div className="flex items-center gap-2 mb-5">
                <Compass className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-bold text-gray-800">Least Explored Places 💎</h2>
                <span className="text-xs text-gray-500 ml-1">— Hidden gems with low tourist footfall</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ranked.slice(-8).reverse().map((p, i) => (
                  <motion.div key={p.id} whileHover={{ y: -2 }}
                    className="rounded-2xl overflow-hidden border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50">
                    <div className="relative h-24 overflow-hidden">
                      <img src={p.image} alt={p.place_name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute top-2 left-2 text-xs bg-teal-500/80 text-white px-2 py-0.5 rounded-full font-medium">
                        💎 Offbeat
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-gray-800 truncate">{p.place_name}</p>
                      <p className="text-xs text-gray-500">{p.state}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-teal-600 font-semibold">{p.visitors_count}K visitors</span>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{p.category}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* State detail table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 overflow-x-auto">
              <h2 className="text-lg font-bold text-gray-800 mb-5">State-wise Tourism Summary</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-50">
                    {['Rank', 'State', 'Total Visitors', 'Places', 'Avg Score', 'Top Place'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-purple-700 first:rounded-l-xl last:rounded-r-xl">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topStates.map((s, i) => (
                    <tr key={s.state} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-bold text-gray-500">#{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{s.state}</td>
                      <td className="px-4 py-3 font-bold text-purple-600">{s.total_visitors.toLocaleString()}K</td>
                      <td className="px-4 py-3 text-gray-600">{s.place_count}</td>
                      <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">{s.avg_popularity}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.top_place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PREDICTION TAB */}
        {activeTab === 'prediction' && (
          <div className="space-y-6">
            {/* AI insight banner */}
            <div className="rounded-3xl p-5 border border-purple-200"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(219,39,119,0.04))' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>🔮</div>
                <div>
                  <p className="font-bold text-gray-800">AI Popularity Prediction Engine</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Score = (Current Popularity × 0.6) + (Growth Factor × 0.4) · Growth based on category boost, offbeat status, and trend direction
                  </p>
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600"><ArrowUp className="w-3 h-3" />{risingCount} Rising</span>
                    <span className="flex items-center gap-1 text-amber-600"><Minus className="w-3 h-3" />{predictions.filter(p => p.trend_tag === '➡️ Stable').length} Stable</span>
                    <span className="flex items-center gap-1 text-red-600"><ArrowDown className="w-3 h-3" />{predictions.filter(p => p.trend_tag === '📉 Declining').length} Declining</span>
                    <span className="flex items-center gap-1 text-purple-600"><Sparkles className="w-3 h-3" />Avg predicted: {avgPredicted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-1 bg-purple-50 rounded-xl p-1">
                {[
                  { id: 'all',     label: 'All Places' },
                  { id: 'rising',  label: '🔥 Rising Only' },
                  { id: 'offbeat', label: '💎 Offbeat Rising' },
                ].map(f => (
                  <button key={f.id} onClick={() => setPredFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      predFilter === f.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2 shadow-sm">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search places..."
                  className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-32" />
                {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
              </div>
              <span className="text-xs text-gray-500">{filteredPreds.length} places</span>
            </div>

            {/* Prediction cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPreds.map((place, i) => (
                <motion.div key={place.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <PredictionCard place={place} rank={i + 1} />
                </motion.div>
              ))}
            </div>

            {/* Future trending section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-800">Future Trending Destinations 🚀</h2>
                <span className="text-xs text-gray-500 ml-1">— AI predicts these will blow up soon</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.filter(p => p.trend_tag === '🔥 Rising' && p.is_offbeat).slice(0, 6).map((p, i) => (
                  <motion.div key={p.id} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
                    className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ height: '180px' }}>
                    <img src={p.image} alt={p.place_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/90 text-white">🔥 Rising</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-500/90 text-white">💎 Offbeat</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm">{p.place_name}</p>
                      <p className="text-white/70 text-xs">{p.state}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/80 text-xs">Now: {p.popularity_score} → <span className="text-emerald-400 font-bold">{p.predicted_score}</span></span>
                        <span className="text-xs text-white/60">{p.category}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
