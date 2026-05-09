'use client';
import { motion } from 'framer-motion';
import { crowdHeatmap } from '@/lib/dummy-data';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function CrowdBar({ city, crowd, trend }: { city: string; crowd: number; trend: string }) {
  const color = crowd > 75 ? 'from-red-500 to-rose-600' : crowd > 50 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-400';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24 truncate font-medium">{city}</span>
      <div className="flex-1 bg-purple-50 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${crowd}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <div className="flex items-center gap-1 w-16">
        <span className="text-sm font-bold text-gray-700">{crowd}%</span>
        <TrendIcon className={`w-3 h-3 ${trendColor}`} />
      </div>
    </div>
  );
}

export function CrowdHeatmap() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-purple-50">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          <Users className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Bheed Heatmap 👥</h3>
          <p className="text-xs text-gray-400">Top Indian destinations mein crowd level</p>
        </div>
      </div>

      <div className="space-y-4">
        {crowdHeatmap.map((item) => (
          <CrowdBar key={item.city} {...item} />
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-purple-50 flex-wrap">
        {[
          { label: 'Kam Bheed', color: 'bg-emerald-500', range: '< 50%' },
          { label: 'Theek Hai', color: 'bg-amber-500', range: '50–75%' },
          { label: 'Bahut Bheed', color: 'bg-red-500', range: '> 75%' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-xs text-gray-500">{l.label} ({l.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
