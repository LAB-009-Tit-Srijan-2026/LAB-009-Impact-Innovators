'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { alerts } from '@/lib/dummy-data';
import { Bell, Cloud, Users, IndianRupee, Shield, ChevronDown, ChevronUp, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const categories = [
  { id: 'all', label: 'Sab Alerts', icon: Bell },
  { id: 'weather', label: 'Mausam', icon: Cloud },
  { id: 'crowd', label: 'Bheed', icon: Users },
  { id: 'pricing', label: 'Daam', icon: IndianRupee },
  { id: 'safety', label: 'Suraksha', icon: Shield },
];

const severityConfig = {
  high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Urgent' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Medium' },
  low: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Info' },
};

function AlertCard({ alert, index }: { alert: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [doneActions, setDoneActions] = useState<string[]>([]);
  const config = severityConfig[alert.severity as keyof typeof severityConfig];

  function handleAction(action: string) {
    setDoneActions(prev => prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-3xl border ${config.bg} ${config.border} overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">{alert.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {alert.type === 'weather' ? '🌤️ Mausam' :
                     alert.type === 'crowd' ? '👥 Bheed' :
                     alert.type === 'pricing' ? '💰 Daam' : '🛡️ Suraksha'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800">{alert.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <span>🇮🇳</span> {alert.destination}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">{format(new Date(alert.timestamp), 'MMM d, HH:mm')}</p>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-xs text-purple-600 flex items-center gap-1 ml-auto"
                >
                  {expanded ? 'Kam' : 'Zyada'}
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-current/10">
                <p className="text-xs font-semibold text-gray-600 mb-2">Kya Karna Chahiye:</p>
                <div className="flex flex-wrap gap-2">
                  {alert.actions.map((action: string) => (
                    <button key={action}
                      onClick={() => handleAction(action)}
                      className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-xl transition-colors font-medium ${
                        doneActions.includes(action)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white/80 border-current/20 text-gray-700 hover:bg-white'
                      }`}>
                      <CheckCircle className={`w-3 h-3 ${doneActions.includes(action) ? 'text-emerald-500' : 'text-purple-500'}`} />
                      {action}
                      {doneActions.includes(action) && <span className="text-emerald-600">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function AlertsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const filtered = activeCategory === 'all' ? alerts : alerts.filter((a) => a.type === activeCategory);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Smart Alerts 🔔</h1>
          <p className="text-sm text-gray-500 mt-1">India travel ke liye real-time intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${alerts.some(a => a.severity === 'high') ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-sm text-gray-600">{alerts.filter(a => a.severity === 'high').length} urgent alerts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex gap-2 mb-5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'text-white shadow-lg'
                    : 'bg-white border border-purple-200 text-gray-600 hover:bg-purple-50'
                }`}
                style={activeCategory === cat.id ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' } : {}}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
                  {cat.id === 'all' ? alerts.length : alerts.filter(a => a.type === cat.id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))}
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-card border border-purple-50">
            <h3 className="font-bold text-gray-800 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Push Notifications', icon: Bell, enabled: pushEnabled, toggle: () => setPushEnabled(!pushEnabled) },
                { label: 'Email Alerts', icon: Mail, enabled: emailEnabled, toggle: () => setEmailEnabled(!emailEnabled) },
                { label: 'SMS Alerts', icon: MessageSquare, enabled: smsEnabled, toggle: () => setSmsEnabled(!smsEnabled) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <button
                    onClick={item.toggle}
                    className={`w-11 h-6 rounded-full transition-colors relative ${item.enabled ? 'bg-purple-500' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5 border border-purple-100" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(219,39,119,0.05))' }}>
            <h3 className="font-bold text-gray-800 mb-3">Alert Summary</h3>
            {Object.entries(severityConfig).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {alerts.filter(a => a.severity === key).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
