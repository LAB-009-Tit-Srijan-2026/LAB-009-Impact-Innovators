'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  nationalStats, topSourceMarkets, stateWiseFTV, stateWiseDTV,
  topMonumentsDomestic, topMonumentsForeign, monthlyFTA2024,
  ageWiseFTA, historicalTrend, globalRanking
} from '@/lib/tourism-data-2025';
import {
  TrendingUp, Globe, Users, IndianRupee, MapPin, Building2,
  Award, BarChart2, Calendar, Info, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';

const COLORS = ['#7c3aed','#db2777','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316'];

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }: {
  icon: any; label: string; value: string; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    purple: 'from-purple-500 to-purple-600', pink: 'from-pink-500 to-rose-500',
    amber:  'from-amber-500 to-orange-500',  green: 'from-emerald-500 to-teal-500',
    blue:   'from-blue-500 to-indigo-500',   red:   'from-red-500 to-rose-600',
  };
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-50">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function TourismStatsPage() {
  const [activeTab, setActiveTab] = useState<'overview'|'states'|'monuments'|'global'>('overview');

  const tabs = [
    { id: 'overview',  label: '📊 Overview'   },
    { id: 'states',    label: '🗺️ States'     },
    { id: 'monuments', label: '🏛️ Monuments'  },
    { id: 'global',    label: '🌍 Global'     },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">
                India Tourism Statistics 2025 🇮🇳
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                India Tourism Data Compendium 2025 (66th Edition) · Ministry of Tourism, Govt. of India · Data Year: 2024
              </p>
            </div>
            <a
              href="https://tourism.gov.in/media/annual-reports"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Official Source
            </a>
          </div>

          {/* Source badge */}
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Source:</strong> Ministry of Tourism, Bureau of Immigration, ASI, RBI, UN Tourism — Official Govt. of India data
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-purple-50 rounded-2xl p-1 mb-6 w-fit flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Headline KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Globe}        label="Intl Tourist Arrivals"  value="20.57M"   sub="Ranked 20th globally"    color="purple" />
              <StatCard icon={Users}        label="Domestic Tourist Visits" value="2,948M"  sub="+17.51% YoY"             color="blue"   />
              <StatCard icon={IndianRupee}  label="Tourism Receipts"        value="$35.02B" sub="Ranked 15th globally"    color="green"  />
              <StatCard icon={TrendingUp}   label="GDP Contribution"        value="5.22%"   sub="of India's total GDP"    color="amber"  />
              <StatCard icon={Building2}    label="Jobs Created"            value="43M+"    sub="8% increase from 2019"   color="pink"   />
              <StatCard icon={Award}        label="UNESCO Heritage Sites"   value="44"      sub="Across India"            color="red"    />
            </div>

            {/* Historical Trend */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <SectionHeader title="Historical Tourism Trend (2019–2024)" subtitle="Foreign Tourist Arrivals & Foreign Exchange Earnings" />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={historicalTrend}>
                  <defs>
                    <linearGradient id="ftaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any, n: string) => [
                    n === 'fta_million' ? `${v}M arrivals` : `$${v}B`,
                    n === 'fta_million' ? 'Foreign Arrivals' : 'FX Earnings'
                  ]} />
                  <Legend formatter={(v) => v === 'fta_million' ? 'Foreign Arrivals (M)' : 'FX Earnings ($B)'} />
                  <Area yAxisId="left"  type="monotone" dataKey="fta_million"     stroke="#7c3aed" fill="url(#ftaGrad)" strokeWidth={2} />
                  <Area yAxisId="right" type="monotone" dataKey="fee_usd_billion" stroke="#10b981" fill="url(#feeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">COVID-19 impact visible in 2020–21, strong recovery from 2022 onwards</p>
            </div>

            {/* Monthly FTA 2024 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <SectionHeader title="Monthly Foreign Tourist Arrivals — 2024" subtitle="Peak season: Oct–Jan (winter months)" />
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyFTA2024}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}M`} />
                  <Tooltip formatter={(v: any) => [`${v}M`, 'FTAs']} />
                  <Bar dataKey="fta" radius={[6,6,0,0]}>
                    {monthlyFTA2024.map((_, i) => (
                      <Cell key={i} fill={i === 11 || i === 0 ? '#7c3aed' : '#c4b5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Source Markets + Age Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Markets */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <SectionHeader title="Top Source Markets for FTAs" subtitle="% share of total Foreign Tourist Arrivals 2024" />
                <div className="space-y-3">
                  {topSourceMarkets.slice(0, 8).map((m) => (
                    <div key={m.country} className="flex items-center gap-3">
                      <span className="text-xl w-8 flex-shrink-0">{m.flag}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{m.country}</span>
                          <span className="text-sm font-bold text-purple-600">{m.share_pct}%</span>
                        </div>
                        <div className="h-2 bg-purple-50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(m.share_pct / 18.13) * 100}%` }}
                            transition={{ duration: 0.8, delay: m.rank * 0.05 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, #7c3aed, #db2777)` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
                        {(m.visitors_approx / 1000).toFixed(0)}K
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Top 10 countries = 68.64% of total FTAs</p>
              </div>

              {/* Age Distribution */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <SectionHeader title="Age-wise FTA Distribution 2024" subtitle="35–44 and 45–54 age groups dominate" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ageWiseFTA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="group" tick={{ fontSize: 12 }} width={45} />
                    <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                    <Bar dataKey="share_pct" radius={[0,6,6,0]}>
                      {ageWiseFTA.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2">Peak age group: 35–44 (20.67%) followed by 45–54 (20.24%)</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STATES TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'states' && (
          <div className="space-y-8">

            {/* FTV Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <SectionHeader title="Top 10 States — Foreign Tourist Visits (FTVs) 2024" subtitle="Maharashtra leads with 3.71M FTVs (17.6% share)" />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stateWiseFTV} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                  <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={(v: any) => [`${v}M visits`, 'FTVs']} />
                  <Bar dataKey="ftv_million" radius={[0,6,6,0]}>
                    {stateWiseFTV.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* FTV Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 overflow-x-auto">
              <SectionHeader title="State-wise Foreign Tourist Visits — Detailed" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-purple-700 rounded-l-xl">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-purple-700">State</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-purple-700">FTVs (Million)</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-purple-700">Share %</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-purple-700 rounded-r-xl">Top Attractions</th>
                  </tr>
                </thead>
                <tbody>
                  {stateWiseFTV.map((s, i) => (
                    <tr key={s.state} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-bold text-gray-500">#{s.rank}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{s.state}</td>
                      <td className="px-4 py-3 text-right font-bold text-purple-600">{s.ftv_million}M</td>
                      <td className="px-4 py-3 text-right text-gray-600">{s.share_pct}%</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.top_attraction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DTV Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <SectionHeader title="Top 10 States — Domestic Tourist Visits (DTVs) 2024" subtitle="UP leads with 646.8M visits (+35.17% YoY)" />
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stateWiseDTV}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="state" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                  <Tooltip formatter={(v: any, n: string) => [
                    n === 'dtv_million' ? `${v}M visits` : `+${v}%`,
                    n === 'dtv_million' ? 'DTVs' : 'YoY Growth'
                  ]} />
                  <Legend />
                  <Bar dataKey="dtv_million" name="DTVs (Million)" radius={[6,6,0,0]}>
                    {stateWiseDTV.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* DTV Table with growth */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 overflow-x-auto">
              <SectionHeader title="State-wise Domestic Tourist Visits — with YoY Growth" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-emerald-700 rounded-l-xl">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-emerald-700">State</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-700">DTVs (Million)</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-700">YoY Growth</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-emerald-700 rounded-r-xl">Top Attractions</th>
                  </tr>
                </thead>
                <tbody>
                  {stateWiseDTV.map((s, i) => (
                    <tr key={s.state} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-bold text-gray-500">#{s.rank}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{s.state}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{s.dtv_million}M</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          +{s.yoy_growth_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.top_attraction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">Top 5 states = 60.38% of total DTVs in India</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MONUMENTS TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'monuments' && (
          <div className="space-y-8">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Domestic */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <SectionHeader title="Top 10 Monuments — Domestic Visitors" subtitle="FY 2024-25 · ASI Centrally Protected Monuments" />
                <div className="space-y-3">
                  {topMonumentsDomestic.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white`}
                        style={{ background: COLORS[i % COLORS.length] }}>
                        {m.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                        <p className="text-xs text-gray-400 truncate">{m.location}</p>
                      </div>
                      <span className="text-sm font-bold text-purple-600 flex-shrink-0">{m.visitors_million}M</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Top 10 = 47% of all domestic ASI monument visits</p>
              </div>

              {/* Foreign */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <SectionHeader title="Top 10 Monuments — Foreign Visitors" subtitle="FY 2024-25 · Agra circuit dominates" />
                <div className="space-y-3">
                  {topMonumentsForeign.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white`}
                        style={{ background: COLORS[i % COLORS.length] }}>
                        {m.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                        <p className="text-xs text-gray-400 truncate">{m.location}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-600 flex-shrink-0">{m.visitors_k}K</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Top 10 = 74% of all foreign heritage visitors · Agra circuit = 4 of top 10</p>
              </div>
            </div>

            {/* Monuments bar chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <SectionHeader title="Domestic vs Foreign Visitors — Top Monuments" subtitle="Taj Mahal leads both categories by a wide margin" />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topMonumentsDomestic.slice(0,8).map((m, i) => ({
                  name: m.name.length > 14 ? m.name.slice(0,14)+'…' : m.name,
                  domestic: m.visitors_million,
                  foreign: (topMonumentsForeign.find(f => f.name === m.name)?.visitors_k ?? 0) / 1000,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                  <Tooltip formatter={(v: any, n: string) => [`${v}M`, n === 'domestic' ? 'Domestic' : 'Foreign']} />
                  <Legend />
                  <Bar dataKey="domestic" name="Domestic (M)" fill="#7c3aed" radius={[4,4,0,0]} />
                  <Bar dataKey="foreign"  name="Foreign (M)"  fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* GLOBAL TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'global' && (
          <div className="space-y-8">

            {/* India vs World */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Globe}       label="India's Global ITA Rank"  value="#20"      sub="20.57M arrivals in 2024"  color="purple" />
              <StatCard icon={IndianRupee} label="Global ITR Rank"          value="#15"      sub="$35.02B receipts"         color="green"  />
              <StatCard icon={TrendingUp}  label="India's Global ITA Share" value="1.40%"   sub="of 1,465M global arrivals" color="blue"   />
            </div>

            {/* India vs Top 5 countries */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
              <SectionHeader title="India vs Top 5 Most-Visited Countries (2024)" subtitle="Global ITA: 1,465 million total · India ranked 20th" />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  ...globalRanking.top5_countries.map((c, i) => ({ name: c.country, arrivals: c.arrivals_million, fill: COLORS[i] })),
                  { name: 'India', arrivals: nationalStats.ita_total_million, fill: '#f59e0b' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                  <Tooltip formatter={(v: any) => [`${v}M arrivals`]} />
                  <Bar dataKey="arrivals" radius={[6,6,0,0]}>
                    {[...globalRanking.top5_countries, { country: 'India' }].map((_, i) => (
                      <Cell key={i} fill={i === 5 ? '#f59e0b' : COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">India highlighted in amber · France leads globally with 102M arrivals</p>
            </div>

            {/* Revenue share */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <SectionHeader title="India Tourism Revenue Split" subtitle="Domestic vs International spending 2024" />
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Domestic Travel', value: 85 },
                      { name: 'Foreign Visitors', value: 15 },
                    ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      <Cell fill="#7c3aed" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 text-center">Domestic tourism = 85% of total tourism revenue</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                <SectionHeader title="Key Global Benchmarks" />
                <div className="space-y-4">
                  {[
                    { label: 'Global ITA Total (2024)',    value: '1,465M',  sub: '+12.17% YoY' },
                    { label: 'India ITA (2024)',           value: '20.57M',  sub: '1.40% global share' },
                    { label: 'Global ITR Total (2024)',    value: '$1,731B', sub: '+12.7% YoY' },
                    { label: 'India ITR (2024)',           value: '$35.02B', sub: '2.02% global share' },
                    { label: 'India GDP from Tourism',     value: '5.22%',   sub: 'of total GDP' },
                    { label: 'India WEF TTCI Rank',        value: '#39',     sub: 'Travel & Tourism Competitiveness' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{item.value}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Data sourced from <strong>India Tourism Data Compendium 2025 (66th Edition)</strong> · Ministry of Tourism, Government of India ·
            Bureau of Immigration · ASI · RBI · UN Tourism ·
            <a href="https://tourism.gov.in" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">tourism.gov.in</a>
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
