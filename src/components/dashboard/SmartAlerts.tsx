'use client';
import { motion } from 'framer-motion';
import { alerts } from '@/lib/dummy-data';
import { Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const severityColors = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export function SmartAlerts() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-purple-50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #db2777)' }}>
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Smart Alerts 🔔</h3>
            <p className="text-xs text-gray-400">{alerts.length} active alerts hain</p>
          </div>
        </div>
        <Link href="/alerts" className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-medium">
          Sab dekho <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 3).map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-2xl border ${severityColors[alert.severity as keyof typeof severityColors]}`}
          >
            <span className="text-xl flex-shrink-0">{alert.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{alert.title}</p>
              <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{alert.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
