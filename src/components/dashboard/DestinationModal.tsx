'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, MapPin, Calendar, Hotel, Heart, ChevronRight, IndianRupee } from 'lucide-react';
import { formatCurrencyFull } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  destination: any;
  onClose: () => void;
}

export function DestinationModal({ destination, onClose }: Props) {
  const { favorites, toggleFavorite } = useAppStore();
  const isFav = favorites.includes(destination.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl overflow-hidden w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Hero */}
          <div className="relative h-64">
            <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-md">
              <X className="w-4 h-4 text-gray-700" />
            </button>
            <button onClick={() => toggleFavorite(destination.id)} className="absolute top-4 right-16 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-md">
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
            <div className="absolute bottom-4 left-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🇮🇳</span>
                <span className="text-white/80 text-sm">{destination.state}, India</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{destination.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-semibold text-sm">{destination.rating}</span>
                  <span className="text-white/70 text-sm">({destination.reviews?.toLocaleString()} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: IndianRupee, label: 'Budget', value: formatCurrencyFull(destination.budget) + '/person', color: 'text-purple-600 bg-purple-50' },
                { icon: Clock, label: 'Duration', value: destination.duration, color: 'text-pink-600 bg-pink-50' },
                { icon: Calendar, label: 'Best Time', value: destination.bestTime, color: 'text-emerald-600 bg-emerald-50' },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-3 ${s.color.split(' ')[1]}`}>
                  <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]} mb-1`} />
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-bold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{destination.description}</p>

            {/* Highlights */}
            {destination.highlights?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-3">🌟 Must-See Jagahein</h3>
                <div className="flex flex-wrap gap-2">
                  {destination.highlights.map((h: string) => (
                    <span key={h} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      ✨ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {destination.itinerary?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-3">📅 Din-by-Din Itinerary</h3>
                <div className="space-y-3">
                  {destination.itinerary.map((day: any) => (
                    <div key={day.day} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                        {day.day}
                      </div>
                      <div className="flex-1 bg-purple-50 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-800">{day.title}</p>
                          <span className="text-xs text-purple-600 font-medium">₹{day.budget.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {day.activities.map((a: string) => (
                            <span key={a} className="text-xs text-gray-500 bg-white rounded-lg px-2 py-0.5 border border-purple-100">{a}</span>
                          ))}
                        </div>
                        {day.hotels?.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Hotel className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{day.hotels[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget breakdown */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-5">
              <h3 className="font-bold text-gray-800 mb-3">💰 Budget Breakdown</h3>
              <div className="space-y-2">
                {[
                  { label: 'Flight/Train', pct: 30, color: 'bg-purple-500' },
                  { label: 'Hotel/Stay', pct: 28, color: 'bg-pink-500' },
                  { label: 'Sightseeing', pct: 22, color: 'bg-amber-500' },
                  { label: 'Khana-Peena', pct: 20, color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-28">{item.label}</span>
                    <div className="flex-1 bg-white rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
              >
                Abhi Book Karo <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white border border-purple-200 text-purple-700 font-semibold py-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                Trip Mein Save Karo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
