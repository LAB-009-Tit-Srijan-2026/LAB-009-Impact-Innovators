'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { myTrips } from '@/lib/dummy-data';
import { formatCurrencyFull, formatDate, getDaysUntil } from '@/lib/utils';
import { Calendar, Users, Clock, Share2, Edit, Download, Plus, MapPin } from 'lucide-react';

const tabs = [
  { id: 'upcoming', label: 'Aane Wali', emoji: '🔜' },
  { id: 'ongoing', label: 'Chal Rahi', emoji: '✈️' },
  { id: 'completed', label: 'Ho Gayi', emoji: '✅' },
];

function TripCard({ trip, index }: { trip: any; index: number }) {
  const daysUntil = getDaysUntil(trip.startDate);
  const statusConfig = {
    upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Aane Wali' },
    ongoing: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Chal Rahi' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Ho Gayi' },
  };
  const sc = statusConfig[trip.status as keyof typeof statusConfig];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl overflow-hidden shadow-card border border-purple-50 group"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
            {sc.label}
          </span>
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
            <Calendar className="w-3 h-3" />
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Clock, label: 'Duration', value: `${trip.duration} din` },
            { icon: Users, label: 'Log', value: trip.travelers },
            { icon: null, label: 'Budget', value: formatCurrencyFull(trip.budget), rupee: true },
          ].map((s) => (
            <div key={s.label} className="text-center bg-purple-50 rounded-2xl p-2">
              {s.rupee
                ? <span className="text-purple-500 font-bold text-sm block mb-1">₹</span>
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
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trip.progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {trip.tags.map((tag: string) => (
            <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <Edit className="w-3.5 h-3.5" /> Edit Karo
          </button>
          <button className="w-9 h-9 flex items-center justify-center bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <Share2 className="w-4 h-4 text-purple-600" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <Download className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const filtered = myTrips.filter((t) => t.status === activeTab);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meri Trips ✈️</h1>
          <p className="text-sm text-gray-500 mt-1">Apni saari travel adventures ek jagah manage karo</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
        >
          <Plus className="w-4 h-4" /> Nayi Trip
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Trips', value: myTrips.length, color: 'from-purple-600 to-pink-600' },
          { label: 'Aane Wali', value: myTrips.filter(t => t.status === 'upcoming').length, color: 'from-blue-500 to-indigo-600' },
          { label: 'Chal Rahi', value: myTrips.filter(t => t.status === 'ongoing').length, color: 'from-emerald-500 to-teal-600' },
          { label: 'Ho Gayi', value: myTrips.filter(t => t.status === 'completed').length, color: 'from-gray-400 to-gray-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-card border border-purple-50">
            <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-purple-50 rounded-2xl p-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label} ({myTrips.filter(t => t.status === tab.id).length})
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filtered.length > 0 ? (
            filtered.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <MapPin className="w-12 h-12 text-purple-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Koi {activeTab} trip nahi hai</p>
              <p className="text-gray-400 text-sm mt-1">Apna agla safar plan karo! 🗺️</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
