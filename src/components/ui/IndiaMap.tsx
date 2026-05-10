'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, IndianRupee, X, ExternalLink } from 'lucide-react';

// Coordinates for each destination
const DEST_COORDS: Record<string, [number, number]> = {
  '1': [26.9124, 75.7873],   // Jaipur
  '2': [9.4981,  76.3388],   // Kerala Backwaters (Alleppey)
  '3': [15.2993, 74.1240],   // Goa
  '4': [32.2396, 77.1887],   // Manali
  '5': [25.3176, 82.9739],   // Varanasi
  '6': [11.7401, 92.6586],   // Andaman
  '7': [34.1526, 77.5771],   // Ladakh
  '8': [12.3375, 75.8069],   // Coorg
};

const CROWD_COLOR = (crowd: number) =>
  crowd >= 75 ? '#ef4444' : crowd >= 50 ? '#f59e0b' : '#10b981';

interface Destination {
  id: string;
  name: string;
  image: string;
  rating: number;
  budget: number;
  duration: string;
  crowd: number;
  tags: string[];
  description: string;
  state: string;
  bestTime: string;
}

interface IndiaMapProps {
  destinations: Destination[];
  onDestinationClick?: (dest: Destination) => void;
  selectedIds?: string[];
  height?: string;
}

export default function IndiaMap({ destinations, onDestinationClick, selectedIds = [], height = '500px' }: IndiaMapProps) {
  const mapRef    = useRef<any>(null);
  const mapElRef  = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [activePin, setActivePin] = useState<Destination | null>(null);
  const [mapReady, setMapReady]   = useState(false);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    // Dynamically import leaflet (SSR safe)
    import('leaflet').then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapElRef.current!, {
        center: [22.5, 80.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      // OpenStreetMap tiles — free, no key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update markers when map is ready or destinations change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    import('leaflet').then(L => {
      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      destinations.forEach(dest => {
        const coords = DEST_COORDS[dest.id];
        if (!coords) return;

        const isSelected = selectedIds.includes(dest.id);
        const color      = isSelected ? '#7c3aed' : CROWD_COLOR(dest.crowd);
        const size       = isSelected ? 44 : 36;

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:${size}px; height:${size}px;
              background:${color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid white;
              box-shadow:0 3px 12px rgba(0,0,0,0.3);
              display:flex; align-items:center; justify-content:center;
              cursor:pointer;
              transition: all 0.2s;
            ">
              <span style="transform:rotate(45deg); font-size:${isSelected ? 18 : 14}px; line-height:1;">
                ${dest.tags.includes('Beach') ? '🏖️' :
                  dest.tags.includes('Mountains') || dest.tags.includes('Adventure') ? '🏔️' :
                  dest.tags.includes('Heritage') || dest.tags.includes('Spiritual') ? '🏛️' :
                  dest.tags.includes('Nature') ? '🌿' : '📍'}
              </span>
            </div>
          `,
          iconSize:   [size, size],
          iconAnchor: [size / 2, size],
        });

        const marker = L.marker(coords, { icon })
          .addTo(mapRef.current)
          .on('click', () => {
            setActivePin(dest);
            onDestinationClick?.(dest);
            mapRef.current.flyTo(coords, 7, { duration: 1 });
          });

        // Tooltip on hover
        marker.bindTooltip(`
          <div style="font-family:Inter,sans-serif; padding:4px 2px;">
            <strong style="font-size:13px;">${dest.name}</strong><br/>
            <span style="font-size:11px; color:#6b7280;">⭐ ${dest.rating} · ₹${dest.budget.toLocaleString()}</span>
          </div>
        `, { direction: 'top', offset: [0, -size] });

        markersRef.current.push(marker);
      });
    });
  }, [mapReady, destinations, selectedIds]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-100 shadow-card" style={{ height }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Map container */}
      <div ref={mapElRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-purple-50">
        <p className="text-xs font-semibold text-gray-600 mb-1.5">Crowd Level</p>
        <div className="space-y-1">
          {[
            { color: '#10b981', label: 'Low (< 50%)' },
            { color: '#f59e0b', label: 'Medium (50–75%)' },
            { color: '#ef4444', label: 'High (> 75%)' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active pin popup */}
      <AnimatePresence>
        {activePin && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-4 right-4 z-[1000] w-64 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden"
          >
            <div className="relative h-28">
              <img src={activePin.image} alt={activePin.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setActivePin(null)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="absolute bottom-2 left-3">
                <p className="text-white font-bold text-sm">{activePin.name}</p>
                <p className="text-white/70 text-xs">{activePin.state}</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-gray-700">{activePin.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-700">{activePin.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-sm text-gray-600">{activePin.duration}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{activePin.description}</p>
              <div className="flex gap-1 flex-wrap">
                {activePin.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-400">Best: {activePin.bestTime}</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: CROWD_COLOR(activePin.crowd) }} />
                  <span className="text-xs text-gray-500">{activePin.crowd}% crowd</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
