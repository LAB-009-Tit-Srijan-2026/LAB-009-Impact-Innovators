'use client';
import { motion } from 'framer-motion';
import { Heart, Star, Clock, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrencyFull } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  budget: number;
  duration: string;
  crowd: number;
  tags: string[];
  description: string;
  state?: string;
}

interface Props {
  destination: Destination;
  onClick: () => void;
  index: number;
}

function CrowdRing({ percent }: { percent: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const color = percent > 75 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{percent}%</span>
    </div>
  );
}

const tagColors: Record<string, string> = {
  Heritage: 'bg-amber-100 text-amber-700',
  Royal: 'bg-purple-100 text-purple-700',
  Culture: 'bg-pink-100 text-pink-700',
  Nature: 'bg-green-100 text-green-700',
  Peaceful: 'bg-teal-100 text-teal-700',
  Ayurveda: 'bg-emerald-100 text-emerald-700',
  Beach: 'bg-blue-100 text-blue-700',
  Party: 'bg-orange-100 text-orange-700',
  Adventure: 'bg-red-100 text-red-700',
  Mountains: 'bg-indigo-100 text-indigo-700',
  Snow: 'bg-sky-100 text-sky-700',
  Spiritual: 'bg-violet-100 text-violet-700',
  Diving: 'bg-cyan-100 text-cyan-700',
  Luxury: 'bg-yellow-100 text-yellow-700',
  Coffee: 'bg-amber-100 text-amber-800',
  Trekking: 'bg-lime-100 text-lime-700',
};

export function DestinationCard({ destination, onClick, index }: Props) {
  const { favorites, toggleFavorite } = useAppStore();
  const isFav = favorites.includes(destination.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden shadow-card border border-purple-50 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(destination.id); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>

        {/* State badge */}
        {destination.state && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <span className="text-xs">🇮🇳</span>
            <span className="text-xs font-medium text-gray-700">{destination.state}</span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {destination.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-white/90 text-gray-700'}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{destination.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{destination.rating}</span>
              <span className="text-xs text-gray-400">({destination.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>
          <CrowdRing percent={destination.crowd} />
        </div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{destination.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-purple-50">
          <div className="flex items-center gap-1">
            <span className="text-purple-600 font-bold text-sm">₹</span>
            <span className="text-sm font-bold text-gray-800">{formatCurrencyFull(destination.budget)}</span>
            <span className="text-xs text-gray-400">/ person</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{destination.duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
