'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { myTrips } from '@/lib/dummy-data';
import { formatCurrencyFull, formatDate, getDaysUntil } from '@/lib/utils';
import { Calendar, Users, Clock, Share2, Edit, Download, Plus, MapPin, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const tabs = [
  { id: 'upcoming', label: 'Aane Wali', emoji: '🔜' },
  { id: 'ongoing',  label: 'Chal Rahi', emoji: '✈️'  },
  { id: 'completed',label: 'Ho Gayi',   emoji: '✅'  },
];

const statusConfig = {
  upcoming:  { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Aane Wali' },
  ongoing:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Chal Rahi' },
  completed: { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Ho Gayi'   },
};

function EditModal({ trip, onClose, onSave }: { trip: any; onClose: () => void; onSave: (t: any) => void }) {
  const [dest, setDest] = useState(trip.destination);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-lg">Trip Edit Karo ✏️</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Destination</label>
            <input value={dest} onChange={e => setDest(e.target.value)}
              className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Start Date</label>
              <input type="date" defaultValue={trip.startDate}
                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">End Date</label>
              <input type="date" defaultValue={trip.endDate}
                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-purple-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-purple-50">Cancel</button>
          <button onClick={() => { onSave({ ...trip, destination: dest }); onClose(); }}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <Check className="w-4 h-4" /> Save Karo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TripCard({ trip, index, onEdit }: { trip: any; index: number; onEdit: (t: any) => void }) {
  const [toast, setToast] = useState('');
  const daysUntil = getDaysUntil(trip.startDate);
  const sc = statusConfig[trip.status as keyof typeof statusConfig];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleShare() {
    const text = `🇮🇳 ${trip.destination} Trip — ${formatDate(trip.startDate)} to ${formatDate(trip.endDate)} | ${trip.travelers} travelers | Budget: ${formatCurrencyFull(trip.budget)}`;
    if (navigator.share) {
      navigator.share({ title: 'My TripNexus Trip', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('📋 Trip details copied to clipboard!');
    }
  }

  function handleDownload() {
    const content = [
      `TripNexus — Trip Summary`,
      `========================`,
      `Destination: ${trip.destination}`,
      `Dates: ${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`,
      `Duration: ${trip.duration} days`,
      `Travelers: ${trip.travelers}`,
      `Budget: ${formatCurrencyFull(trip.budget)}`,
      `Status: ${sc.label}`,
      `Tags: ${trip.tags.join(', ')}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${trip.destination.replace(/,\s*/g, '_')}_trip.txt`;
    a.click(); URL.revokeObjectURL(url);
    showToast('📥 Trip summary downloaded!');
  }

  return (
    <>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed top-20 right-6 z-50 bg-white border border-purple-200 rounded-2xl px-4 py-2.5 shadow-xl text-sm font-medium text-gray-800">
          {toast}
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }}
        className="bg-white rounded-3xl overflow-hidden shadow-card border border-purple-50 group">
        <div className="relative h-44 overflow-hidden">
          <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
          </div>
          {trip.status === 'upcoming' && daysUntil > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1 text-center">
              <p className="text-lg font-bold text-purple-700 leading-none">{daysUntil}</p>
              <p className="text-xs text-gray-500">din baad</p>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <h3 className="text-white font-bold text-base">{trip.destination}</h3>
            <p className="text-white/80 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </p>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Clock, label: 'Duration', value: `${trip.duration} din` },
              { icon: Users, label: 'Log',      value: trip.travelers },
              { icon: null,  label: 'Budget',   value: formatCurrencyFull(trip.budget), rupee: true },
            ].map((s) => (
              <div key={s.label} className="text-center bg-purple-50 rounded-2xl p-2">
                {s.rupee ? <span className="text-purple-500 font-bold text-sm block mb-1">₹</span>
                  : s.icon && <s.icon className="w-4 h-4 text-purple-500 mx-auto mb-1" />}
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-xs font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>
          {trip.status !== 'upcoming' && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Trip Progress</span>
                <span className="font-semibold text-purple-600">{trip.progress}%</span>
              </div>
              <div className="bg-purple-50 rounded-full h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${trip.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }} className="h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }} />
              </div>
            </div>
          )}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {trip.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(trip)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              <Edit className="w-3.5 h-3.5" /> Edit Karo
            </button>
            <button onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors" title="Share">
              <Share2 className="w-4 h-4 text-purple-600" />
            </button>
            <button onClick={handleDownload}
              className="w-9 h-9 flex items-center justify-center bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors" title="Download">
              <Download className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function TripsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [editTrip, setEditTrip]   = useState<any>(null);
  const [trips, setTrips]         = useState(myTrips);
  const filtered = trips.filter(t => t.status === activeTab);

  function handleSave(updated: any) {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
  }

  return (
    <AppLayout>
      <AnimatePresence>
        {editTrip && <EditModal trip={editTrip} onClose={() => setEditTrip(null)} onSave={handleSave} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meri Trips ✈️</h1>
          <p className="text-sm text-gray-500 mt-1">Apni saari travel adventures ek jagah manage karo</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/plan')}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <Plus className="w-4 h-4" /> Nayi Trip
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Trips', value: trips.length, color: 'from-purple-600 to-pink-600' },
          { label: 'Aane Wali',   value: trips.filter(t => t.status === 'upcoming').length,  color: 'from-blue-500 to-indigo-600'   },
          { label: 'Chal Rahi',   value: trips.filter(t => t.status === 'ongoing').length,   color: 'from-emerald-500 to-teal-600'  },
          { label: 'Ho Gayi',     value: trips.filter(t => t.status === 'completed').length, color: 'from-gray-400 to-gray-600'     },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-card border border-purple-50">
            <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-purple-50 rounded-2xl p-1 w-fit mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span>{tab.emoji}</span>{tab.label} ({trips.filter(t => t.status === tab.id).length})
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.length > 0
            ? filtered.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} onEdit={setEditTrip} />)
            : (
              <div className="col-span-full text-center py-16">
                <MapPin className="w-12 h-12 text-purple-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Koi {activeTab} trip nahi hai</p>
                <p className="text-gray-400 text-sm mt-1">Apna agla safar plan karo! 🗺️</p>
                <button onClick={() => router.push('/plan')}
                  className="mt-4 px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                  Trip Plan Karo
                </button>
              </div>
            )}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
