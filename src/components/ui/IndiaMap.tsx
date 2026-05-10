'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, IndianRupee, X, Flame, LayoutGrid } from 'lucide-react';
import { generateHeatmapData } from '@/lib/intelligence-data';

const DEST_COORDS: Record<string, [number, number]> = {
  '1': [26.9124,75.7873], '2': [9.4981,76.3388],  '3': [15.2993,74.1240],
  '4': [32.2396,77.1887], '5': [25.3176,82.9739],  '6': [11.7401,92.6586],
  '7': [34.1526,77.5771], '8': [12.3375,75.8069],  '9': [27.1751,78.0421],
  '10':[30.0869,78.2676], '11':[24.5854,73.7125],  '12':[27.0360,88.2627],
  '13':[12.3052,76.6552], '14':[31.1048,77.1734],  '15':[31.6340,74.8723],
  '16':[10.0889,77.0595], '17':[26.9157,70.9083],  '18':[11.4102,76.6950],
  '19':[32.2461,78.0338], '20':[15.3350,76.4600],  '21':[23.7337,70.8022],
  '22':[11.9416,79.8083], '23':[24.8318,79.9199],  '24':[34.1642,77.5847],
  '25':[12.6269,80.1927], '26':[26.5775,93.1711],  '27':[26.4899,74.5511],
  '28':[9.4981,76.3388],  '29':[29.3919,79.4542],  '30':[26.2389,73.0243],
  '31':[19.8135,85.8312], '32':[25.5788,91.8933],  '33':[13.6288,79.4192],
  '34':[17.9307,73.6477], '35':[32.9915,74.9520],  '36':[19.8762,75.3433],
  '37':[22.5726,88.3639], '38':[17.3850,78.4867],  '39':[9.9312,76.2673],
  '40':[23.2599,77.4126], '41':[27.3389,88.6065],  '42':[26.4499,74.6399],
  '43':[26.1445,91.7362], '44':[27.4924,77.6737],  '45':[18.7546,73.4062],
  '46':[27.5860,91.8590], '47':[22.2394,68.9678],  '48':[11.0168,76.9558],
  '49':[14.5479,74.3188], '50':[27.5330,93.8330],
};

const CROWD_COLOR = (crowd: number) =>
  crowd >= 75 ? '#ef4444' : crowd >= 50 ? '#f59e0b' : '#10b981';

interface Destination {
  id: string; name: string; image: string; rating: number; budget: number;
  duration: string; crowd: number; tags: string[]; description: string;
  state: string; bestTime: string;
}

interface IndiaMapProps {
  destinations: Destination[];
  onDestinationClick?: (dest: Destination) => void;
  selectedIds?: string[];
  height?: string;
  showHeatmapToggle?: boolean;
}

export default function IndiaMap({
  destinations, onDestinationClick, selectedIds = [],
  height = '500px', showHeatmapToggle = false,
}: IndiaMapProps) {
  const mapRef      = useRef<any>(null);
  const mapElRef    = useRef<HTMLDivElement>(null);
  const markersRef  = useRef<any[]>([]);
  const heatLayerRef = useRef<any>(null);
  const [activePin, setActivePin]   = useState<Destination | null>(null);
  const [mapReady, setMapReady]     = useState(false);
  const [viewMode, setViewMode]     = useState<'markers' | 'heatmap'>('markers');

  // Init map
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const map = L.map(mapElRef.current!, { center: [22.5, 80.0], zoom: 5, zoomControl: true, scrollWheelZoom: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Markers layer
  useEffect(() => {
    if (!mapReady || !mapRef.current || viewMode !== 'markers') return;
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (heatLayerRef.current) { heatLayerRef.current.remove(); heatLayerRef.current = null; }

      destinations.forEach(dest => {
        const coords = DEST_COORDS[dest.id];
        if (!coords) return;
        const isSelected = selectedIds.includes(dest.id);
        const color = isSelected ? '#7c3aed' : CROWD_COLOR(dest.crowd);
        const size  = isSelected ? 44 : 36;
        const icon  = L.divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <span style="transform:rotate(45deg);font-size:${isSelected ? 18 : 14}px;line-height:1;">
              ${dest.tags.includes('Beach') ? '🏖️' : dest.tags.includes('Mountains') || dest.tags.includes('Adventure') ? '🏔️' : dest.tags.includes('Heritage') || dest.tags.includes('Spiritual') ? '🏛️' : dest.tags.includes('Nature') ? '🌿' : '📍'}
            </span></div>`,
          iconSize: [size, size], iconAnchor: [size / 2, size],
        });
        const marker = L.marker(coords, { icon }).addTo(mapRef.current)
          .on('click', () => { setActivePin(dest); onDestinationClick?.(dest); mapRef.current.flyTo(coords, 7, { duration: 1 }); });
        marker.bindTooltip(`<div style="font-family:Inter,sans-serif;padding:4px 2px;"><strong style="font-size:13px;">${dest.name}</strong><br/><span style="font-size:11px;color:#6b7280;">⭐ ${dest.rating} · ₹${dest.budget.toLocaleString()}</span></div>`, { direction: 'top', offset: [0, -size] });
        markersRef.current.push(marker);
      });
    });
  }, [mapReady, destinations, selectedIds, viewMode]);

  // Heatmap layer — CSS gradient circles (no extra plugin needed)
  useEffect(() => {
    if (!mapReady || !mapRef.current || viewMode !== 'heatmap') return;
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (heatLayerRef.current) { heatLayerRef.current.remove(); heatLayerRef.current = null; }

      const heatPoints = generateHeatmapData();
      const layers: any[] = [];

      heatPoints.forEach(pt => {
        const radius = 40 + pt.intensity * 80; // 40–120px
        const opacity = 0.25 + pt.intensity * 0.55;
        // Color: cool blue → warm red based on intensity
        const r = Math.round(pt.intensity * 239);
        const g = Math.round((1 - pt.intensity) * 100 + 50);
        const b = Math.round((1 - pt.intensity) * 200);
        const color = `rgba(${r},${g},${b},${opacity})`;

        const circle = L.circle([pt.lat, pt.lng], {
          radius: radius * 1200,
          color: 'transparent',
          fillColor: color,
          fillOpacity: opacity,
          weight: 0,
        }).addTo(mapRef.current);

        circle.bindTooltip(`<div style="font-family:Inter,sans-serif;padding:4px;"><strong>${pt.place_name}</strong><br/><span style="font-size:11px;color:#6b7280;">${(pt.visitors_count).toLocaleString()}K visitors/year</span></div>`);
        layers.push(circle);
      });

      heatLayerRef.current = { remove: () => layers.forEach(l => l.remove()) };
    });
  }, [mapReady, viewMode]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-100 shadow-card" style={{ height }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapElRef} className="w-full h-full" />

      {/* View mode toggle */}
      {showHeatmapToggle && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-purple-100">
          {[
            { id: 'markers', icon: LayoutGrid, label: 'Markers' },
            { id: 'heatmap', icon: Flame,      label: 'Heatmap' },
          ].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === v.id ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              style={viewMode === v.id ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' } : {}}>
              <v.icon className="w-3.5 h-3.5" />{v.label}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-purple-50">
        {viewMode === 'markers' ? (
          <>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Crowd Level</p>
            {[{ color: '#10b981', label: 'Low (< 50%)' }, { color: '#f59e0b', label: 'Medium (50–75%)' }, { color: '#ef4444', label: 'High (> 75%)' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 mb-1">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Tourist Density</p>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-16 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(0,100,200,0.4), rgba(239,68,68,0.8))' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400"><span>Low</span><span>High</span></div>
          </>
        )}
      </div>

      {/* Active pin popup */}
      <AnimatePresence>
        {activePin && viewMode === 'markers' && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute top-4 right-4 z-[1000] w-64 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
            <div className="relative h-28">
              <img src={activePin.image} alt={activePin.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setActivePin(null)} className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="absolute bottom-2 left-3">
                <p className="text-white font-bold text-sm">{activePin.name}</p>
                <p className="text-white/70 text-xs">{activePin.state}</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm font-semibold text-gray-700">{activePin.rating}</span></div>
                <div className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-emerald-500" /><span className="text-sm font-semibold text-gray-700">{activePin.budget.toLocaleString()}</span></div>
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-500" /><span className="text-sm text-gray-600">{activePin.duration}</span></div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{activePin.description}</p>
              <div className="flex gap-1 flex-wrap">
                {activePin.tags.slice(0, 3).map(t => <span key={t} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{t}</span>)}
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
