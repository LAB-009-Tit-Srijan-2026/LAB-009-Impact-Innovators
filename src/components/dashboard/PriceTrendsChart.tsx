'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { priceTrends } from '@/lib/dummy-data';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-3">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-600 capitalize">{p.name}:</span>
            <span className="font-semibold text-gray-800">₹{p.value.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PriceTrendsChart() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-purple-50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Travel Price Trends</h3>
            <p className="text-xs text-gray-400">India mein average prices (₹ mein)</p>
          </div>
        </div>
        <select className="text-xs bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5 text-purple-700 outline-none">
          <option>2026</option>
          <option>2025</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={priceTrends} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="flights" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hotels" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#db2777" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#db2777" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="activities" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f0ff" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
          <Area type="monotone" dataKey="flights" name="Flights" stroke="#7c3aed" strokeWidth={2} fill="url(#flights)" />
          <Area type="monotone" dataKey="hotels" name="Hotels" stroke="#db2777" strokeWidth={2} fill="url(#hotels)" />
          <Area type="monotone" dataKey="activities" name="Activities" stroke="#f59e0b" strokeWidth={2} fill="url(#activities)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
