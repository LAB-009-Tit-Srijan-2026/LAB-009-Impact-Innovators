'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Square, ChevronDown, ChevronRight,
  MapPin, Star, Truck, Hotel, Menu, X, Leaf, Drumstick,
  Mountain, Zap, UtensilsCrossed, RotateCcw, Save,
  Thermometer, Wind, Droplets, Camera, Compass, TreePine,
  PawPrint, Flame, Coffee, Building2, CloudRain, Sun,
  BookOpen, ShoppingBag, Tent, Car, Bike as BikeIcon
} from 'lucide-react';

// ─── ICON MAP (category → Lucide component) ────────────────────────────────────
// Swap any key to remap icons without touching UI logic
const categoryIconMap: Record<string, React.ElementType> = {
  Nature:     TreePine,
  Viewpoint:  Compass,
  Trek:       Mountain,
  Wildlife:   PawPrint,
  Spiritual:  Flame,
  Heritage:   BookOpen,
  Shopping:   ShoppingBag,
  Camping:    Tent,
  // Vehicle types
  Jeep:       Car,
  Scooty:     BikeIcon,
  Bike:       BikeIcon,
  // Gourmet categories
  restaurant: UtensilsCrossed,
  cloud_kitchen: Zap,
  inn:        Hotel,
  // Weather
  Sunny:      Sun,
  Rainy:      CloudRain,
  Cloudy:     CloudRain,
};

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type CheckState = 'complete' | 'incomplete' | 'pending';

interface ChecklistItem {
  id: string;
  label: string;
  state: CheckState;
  children?: ChecklistItem[];
}

interface LocalGem {
  id: string;
  title: string;
  irony_tag: string;
  description: string;
  image: string;
  rating: number;
  altitude?: string;
  category: string;
}

interface Vehicle {
  id: string;
  type: string;
  model: string;
  price_per_day: number;
  icon: string;
  available: boolean;
  features: string[];
}

interface StaySample {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  rating: number;
  image: string;
  amenities: string[];
}

interface GourmetItem {
  id: string;
  name: string;
  type: 'veg' | 'nonveg' | 'both';
  category: 'restaurant' | 'cloud_kitchen' | 'inn';
  cuisine: string;
  price_range: string;
  rating: number;
  image: string;
  specialty: string;
  actions: string[];
}

interface WeatherInfo {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  icon: string;
}

interface TripData {
  destination: string;
  tagline: string;
  weather: WeatherInfo;
  checklistItems: ChecklistItem[];
  localGems: LocalGem[];
  logistics: { stays: StaySample[]; vehicles: Vehicle[] };
  gourmetSelections: GourmetItem[];
}

// ─── CENTRAL DATA CONSTANT ─────────────────────────────────────────────────────
const tripData: TripData = {
  destination: 'Nainital',
  tagline: 'The Lake District of India — Where Every Turn Tells a Story',
  weather: { temp: 14, condition: 'Cloudy', humidity: 72, wind: 12, icon: '⛅' },

  checklistItems: [
    {
      id: 'ck_docs', label: 'Travel Documents', state: 'complete',
      children: [
        { id: 'ck_id',        label: 'Government ID / Aadhaar',  state: 'complete'   },
        { id: 'ck_permit',    label: 'Hill Station Permit',       state: 'complete'   },
        { id: 'ck_insurance', label: 'Travel Insurance',          state: 'incomplete' },
      ],
    },
    {
      id: 'ck_accom', label: 'Accommodation Type', state: 'pending',
      children: [
        { id: 'ck_hotel',   label: 'Hotels (3★–5★)',    state: 'complete'   },
        { id: 'ck_pg',      label: 'PG / Homestay',     state: 'pending'    },
        { id: 'ck_resort',  label: 'Lake-View Resort',  state: 'incomplete' },
        { id: 'ck_hostel',  label: 'Budget Hostel',     state: 'pending'    },
      ],
    },
    {
      id: 'ck_traveler', label: 'Traveler Archetypes', state: 'pending',
      children: [
        { id: 'ck_family',    label: 'Family (Kids Friendly)', state: 'complete'   },
        { id: 'ck_couple',    label: 'Couple / Honeymoon',     state: 'incomplete' },
        { id: 'ck_adventure', label: 'Adventure Seeker',       state: 'pending'    },
        { id: 'ck_solo',      label: 'Solo Backpacker',        state: 'incomplete' },
      ],
    },
    {
      id: 'ck_dining', label: 'Dining Styles', state: 'pending',
      children: [
        { id: 'ck_local',      label: 'Local Kumaoni Cuisine', state: 'complete'   },
        { id: 'ck_cafe',       label: 'Lakeside Cafés',        state: 'complete'   },
        { id: 'ck_finedine',   label: 'Fine Dining',           state: 'pending'    },
        { id: 'ck_streetfood', label: 'Street Food Trail',     state: 'incomplete' },
      ],
    },
    {
      id: 'ck_gear', label: 'Packing & Gear', state: 'incomplete',
      children: [
        { id: 'ck_warmclothes', label: 'Warm Clothes / Jacket', state: 'complete'   },
        { id: 'ck_trekshoes',   label: 'Trek Shoes',            state: 'incomplete' },
        { id: 'ck_raincoat',    label: 'Raincoat / Poncho',     state: 'pending'    },
        { id: 'ck_powerbank',   label: 'Power Bank',            state: 'complete'   },
      ],
    },
  ],

  localGems: [
    {
      id: 'gem_01', title: 'Naini Lake', irony_tag: 'Serenity Paradox',
      description: 'A glacial lake surrounded by hills — most peaceful at 5 AM before the tourist rush hits.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      rating: 4.9, altitude: '2,084m', category: 'Nature',
    },
    {
      id: 'gem_02', title: 'Snow View Point', irony_tag: 'Visibility Irony',
      description: 'Named for Himalayan snow views — best seen in winter when tourists avoid it.',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
      rating: 4.7, altitude: '2,270m', category: 'Viewpoint',
    },
    {
      id: 'gem_03', title: 'Tiffin Top', irony_tag: 'Effort Reward',
      description: '4km trek rewarded with a 360° Himalayan panorama. The harder the climb, the better the view.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
      rating: 4.8, altitude: '2,292m', category: 'Trek',
    },
    {
      id: 'gem_04', title: 'Naini Zoo', irony_tag: 'Altitude Irony',
      description: 'Unique high-altitude wildlife where a short walk feels like a mountain climb.',
      image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80',
      rating: 4.3, altitude: '2,100m', category: 'Wildlife',
    },
    {
      id: 'gem_05', title: 'Naina Devi Temple', irony_tag: 'Spiritual Contrast',
      description: 'Ancient temple on the lake shore — divine calm amid the busiest market street.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80',
      rating: 4.9, category: 'Spiritual',
    },
    {
      id: 'gem_06', title: 'Bhimtal Lake', irony_tag: 'Hidden Gem',
      description: "Nainital's quieter twin — an island aquarium in the middle of the lake.",
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
      rating: 4.6, altitude: '1,370m', category: 'Nature',
    },
  ],

  logistics: {
    stays: [
      {
        id: 'stay_01', name: 'The Manu Maharani', type: 'Heritage Hotel',
        price_per_night: 8500, rating: 4.8,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
        amenities: ['Lake View', 'Spa', 'Restaurant', 'Free WiFi'],
      },
      {
        id: 'stay_02', name: 'Kumaon Himalaya Homestay', type: 'Homestay',
        price_per_night: 2200, rating: 4.6,
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
        amenities: ['Home Cooked Meals', 'Garden', 'Mountain View'],
      },
    ],
    vehicles: [
      {
        id: 'v_01', type: 'Jeep', model: 'Mahindra Thar 4x4',
        price_per_day: 2500, icon: '��', available: true,
        features: ['4WD', 'AC', 'Driver Included'],
      },
      {
        id: 'v_02', type: 'Scooty', model: 'Honda Activa 6G',
        price_per_day: 600, icon: '🛵', available: true,
        features: ['Fuel Efficient', 'Easy Parking'],
      },
      {
        id: 'v_03', type: 'Bike', model: 'Royal Enfield Himalayan',
        price_per_day: 1200, icon: '🏍️', available: false,
        features: ['Off-Road', 'Long Range', 'Adventure Ready'],
      },
    ],
  },

  gourmetSelections: [
    {
      id: 'gour_01', name: "Sakley's Restaurant", type: 'both', category: 'restaurant',
      cuisine: 'Continental & Indian', price_range: '₹400–₹900', rating: 4.7,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      specialty: 'Lake-view dining since 1950s', actions: ['Book Table', 'View Menu'],
    },
    {
      id: 'gour_02', name: 'Kumaoni Kitchen Cloud', type: 'veg', category: 'cloud_kitchen',
      cuisine: 'Kumaoni Traditional', price_range: '₹150–₹350', rating: 4.5,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
      specialty: 'Bhatt ki Churkani & Bal Mithai', actions: ['Order Delivery', 'Track Order'],
    },
    {
      id: 'gour_03', name: 'The Himalayan Inn', type: 'nonveg', category: 'inn',
      cuisine: 'North Indian & Mughlai', price_range: '₹300–₹700', rating: 4.4,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
      specialty: 'Mutton Rogan Josh & Tandoori Platter', actions: ['Book Table', 'Order Delivery'],
    },
    {
      id: 'gour_04', name: 'Café de Mall Road', type: 'veg', category: 'restaurant',
      cuisine: 'Café & Bakery', price_range: '₹100–₹300', rating: 4.6,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
      specialty: 'Freshly baked Bal Mithai & Singori', actions: ['Order Delivery', 'View Menu'],
    },
    {
      id: 'gour_05', name: "Corbett's Den", type: 'nonveg', category: 'inn',
      cuisine: 'Grills & BBQ', price_range: '₹500–₹1200', rating: 4.8,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
      specialty: 'Jungle BBQ & Smoked Trout', actions: ['Book Table', 'View Menu'],
    },
    {
      id: 'gour_06', name: 'Green Leaf Cloud Kitchen', type: 'veg', category: 'cloud_kitchen',
      cuisine: 'Pure Veg & Jain', price_range: '₹120–₹280', rating: 4.3,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
      specialty: 'Sattvic Thali & Herbal Teas', actions: ['Order Delivery'],
    },
  ],
};

// ─── LOCALSTORAGE HELPERS ──────────────────────────────────────────────────────
const LS_KEY = 'tn_checklist_nainital';

function loadFromStorage(defaultMap: Record<string, CheckState>): Record<string, CheckState> {
  if (typeof window === 'undefined') return defaultMap;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultMap;
    return { ...defaultMap, ...JSON.parse(raw) };
  } catch {
    return defaultMap;
  }
}

function saveToStorage(map: Record<string, CheckState>) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch {}
}

function buildDefaultMap(items: ChecklistItem[]): Record<string, CheckState> {
  const map: Record<string, CheckState> = {};
  const walk = (list: ChecklistItem[]) =>
    list.forEach(i => { map[i.id] = i.state; if (i.children) walk(i.children); });
  walk(items);
  return map;
}

// ─── TOAST NOTIFICATION (inline, no extra dep) ────────────────────────────────
interface ToastMsg { id: number; text: string; type: 'success' | 'info' | 'warning' }

function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const show = useCallback((text: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, text, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }: { toasts: ToastMsg[] }) {
  const colors = {
    success: 'bg-emerald-900/90 border-emerald-600/50 text-emerald-200',
    info:    'bg-indigo-900/90 border-indigo-600/50 text-indigo-200',
    warning: 'bg-amber-900/90 border-amber-600/50 text-amber-200',
  };
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium backdrop-blur-md shadow-xl ${colors[t.type]}`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── STATE ICON ────────────────────────────────────────────────────────────────
const stateConfig = {
  complete:   { icon: CheckCircle2, color: 'text-emerald-400' },
  incomplete: { icon: XCircle,      color: 'text-red-400'     },
  pending:    { icon: Square,       color: 'text-zinc-500'    },
};

function StateIcon({ state }: { state: CheckState }) {
  const { icon: Icon, color } = stateConfig[state];
  return <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />;
}

function cycleState(s: CheckState): CheckState {
  return s === 'pending' ? 'complete' : s === 'complete' ? 'incomplete' : 'pending';
}

// ─── TREE NODE ─────────────────────────────────────────────────────────────────
interface TreeNodeProps {
  item: ChecklistItem;
  depth: number;
  stateMap: Record<string, CheckState>;
  onToggleState: (id: string) => void;
  openMap: Record<string, boolean>;
  onToggleOpen: (id: string) => void;
}

function TreeNode({ item, depth, stateMap, onToggleState, openMap, onToggleOpen }: TreeNodeProps) {
  const hasChildren = !!item.children?.length;
  const isOpen = openMap[item.id] ?? true;
  const cur = stateMap[item.id] ?? item.state;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-zinc-700/40 pl-3' : ''}>
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-zinc-700/25 transition-colors group">
        {hasChildren ? (
          <button onClick={() => onToggleOpen(item.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : <span className="w-3.5 flex-shrink-0" />}
        <button onClick={() => onToggleState(item.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
          <StateIcon state={cur} />
        </button>
        <span className={`text-sm select-none flex-1 leading-snug transition-colors ${
          cur === 'complete'   ? 'text-zinc-500 line-through' :
          cur === 'incomplete' ? 'text-red-300/90' : 'text-zinc-300'
        }`}>
          {item.label}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {item.children!.map(child => (
              <TreeNode key={child.id} item={child} depth={depth + 1}
                stateMap={stateMap} onToggleState={onToggleState}
                openMap={openMap} onToggleOpen={onToggleOpen} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CHECKLIST SUMMARY BAR ─────────────────────────────────────────────────────
function ChecklistSummary({ stateMap, items }: { stateMap: Record<string, CheckState>; items: ChecklistItem[] }) {
  const allIds: string[] = [];
  const collect = (list: ChecklistItem[]) =>
    list.forEach(i => { allIds.push(i.id); if (i.children) collect(i.children); });
  collect(items);

  const counts = { complete: 0, incomplete: 0, pending: 0 };
  allIds.forEach(id => { const s = stateMap[id] ?? 'pending'; counts[s]++; });
  const pct = Math.round((counts.complete / allIds.length) * 100);

  return (
    <div className="mb-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-400">Trip Readiness</span>
        <span className={`text-xs font-bold ${pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${pct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : pct >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <div className="flex gap-3 mt-2 flex-wrap">
        <span className="text-xs text-emerald-400">✓ {counts.complete} done</span>
        <span className="text-xs text-red-400">✗ {counts.incomplete} missing</span>
        <span className="text-xs text-zinc-500">○ {counts.pending} open</span>
      </div>
    </div>
  );
}

// ─── WEATHER WIDGET ────────────────────────────────────────────────────────────
function WeatherWidget({ weather, destination }: { weather: WeatherInfo; destination: string }) {
  return (
    <div className="mx-4 mb-3 p-3 rounded-xl bg-gradient-to-br from-indigo-900/40 to-blue-900/30 border border-indigo-700/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">{destination} Weather</p>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold text-zinc-100">{weather.temp}°C</span>
            <span className="text-xs text-zinc-400 mb-0.5">{weather.condition}</span>
          </div>
        </div>
        <span className="text-3xl">{weather.icon}</span>
      </div>
      <div className="flex gap-3 mt-2">
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Droplets className="w-3 h-3 text-blue-400" />{weather.humidity}%
        </span>
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Wind className="w-3 h-3 text-zinc-400" />{weather.wind} km/h
        </span>
      </div>
    </div>
  );
}

// ─── GEM CARD ──────────────────────────────────────────────────────────────────
function GemCard({ gem }: { gem: LocalGem }) {
  const CatIcon = categoryIconMap[gem.category] ?? Camera;
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl overflow-hidden bg-[#1E1E1E] border border-zinc-800 hover:border-indigo-500/40 transition-colors group cursor-pointer"
    >
      <div className="relative h-36 overflow-hidden">
        <img src={gem.image} alt={gem.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600/80 text-white backdrop-blur-sm flex items-center gap-1">
          <CatIcon className="w-3 h-3" />{gem.category}
        </span>
        {gem.altitude && (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/50 text-zinc-300 backdrop-blur-sm flex items-center gap-1">
            <Mountain className="w-3 h-3" />{gem.altitude}
          </span>
        )}
        <p className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm leading-tight">{gem.title}</p>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            ✦ {gem.irony_tag}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-zinc-400">{gem.rating}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{gem.description}</p>
      </div>
    </motion.div>
  );
}

// ─── VEHICLE ROW ───────────────────────────────────────────────────────────────
function VehicleRow({ vehicle, selected, onSelect }: {
  vehicle: Vehicle; selected: boolean; onSelect: () => void;
}) {
  const VIcon = categoryIconMap[vehicle.type] ?? Car;
  return (
    <button
      onClick={onSelect}
      disabled={!vehicle.available}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        selected
          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-900/20'
          : vehicle.available
          ? 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-600 hover:bg-zinc-800/70'
          : 'border-zinc-800 bg-zinc-900/40 opacity-40 cursor-not-allowed'
      }`}
    >
      <span className="text-2xl">{vehicle.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-200">{vehicle.type}</p>
        <p className="text-xs text-zinc-500 truncate">{vehicle.model}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {vehicle.features.map(f => (
            <span key={f} className="text-xs bg-zinc-700/50 text-zinc-500 px-1.5 py-0.5 rounded">{f}</span>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-emerald-400">₹{vehicle.price_per_day.toLocaleString()}</p>
        <p className="text-xs text-zinc-600">/day</p>
      </div>
      {!vehicle.available && (
        <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full flex-shrink-0">Booked</span>
      )}
      {selected && vehicle.available && (
        <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
      )}
    </button>
  );
}

// ─── STAY CARD ─────────────────────────────────────────────────────────────────
function StayCard({ stay }: { stay: StaySample }) {
  return (
    <div className="rounded-xl overflow-hidden bg-zinc-800/40 border border-zinc-700/40 flex gap-3 p-3">
      <img src={stay.image} alt={stay.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-100 truncate">{stay.name}</p>
        <p className="text-xs text-indigo-400 mb-1">{stay.type}</p>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs text-zinc-400">{stay.rating}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {stay.amenities.slice(0, 3).map(a => (
            <span key={a} className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded-full">{a}</span>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-emerald-400">₹{stay.price_per_night.toLocaleString()}</p>
        <p className="text-xs text-zinc-600">/night</p>
        <button className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          Book
        </button>
      </div>
    </div>
  );
}

// ─── GOURMET CARD ──────────────────────────────────────────────────────────────
function GourmetCard({ card, onAction }: { card: GourmetItem; onAction: (action: string, name: string) => void }) {
  const typeColors = {
    veg:    { dot: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-400/10', label: 'Pure Veg'  },
    nonveg: { dot: 'bg-red-500',     badge: 'text-red-400 bg-red-400/10',         label: 'Non-Veg'   },
    both:   { dot: 'bg-amber-500',   badge: 'text-amber-400 bg-amber-400/10',     label: 'Veg & Non' },
  };
  const tc = typeColors[card.type];
  const CatIcon = categoryIconMap[card.category] ?? UtensilsCrossed;
  const catLabel = card.category === 'cloud_kitchen' ? 'Cloud Kitchen' : card.category === 'inn' ? 'Inn' : 'Restaurant';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl overflow-hidden bg-[#1E1E1E] border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      <div className="relative h-32 overflow-hidden">
        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${tc.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{tc.label}
        </span>
        <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/50 text-zinc-300 backdrop-blur-sm flex items-center gap-1">
          <CatIcon className="w-3 h-3" />{catLabel}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-zinc-100 leading-tight">{card.name}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-zinc-400">{card.rating}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mb-1">{card.cuisine} · {card.price_range}</p>
        <p className="text-xs text-zinc-600 italic mb-3 line-clamp-1">{card.specialty}</p>
        <div className="flex gap-2 flex-wrap">
          {card.actions.map(action => (
            <button
              key={action}
              onClick={() => onAction(action, card.name)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                action === 'Book Table'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'
                  : action === 'Order Delivery'
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function TripNexusDashboard() {
  const defaultMap = buildDefaultMap(tripData.checklistItems);

  // ── State ──
  const [stateMap, setStateMap] = useState<Record<string, CheckState>>(
    () => loadFromStorage(defaultMap)
  );
  const [openMap, setOpenMap]     = useState<Record<string, boolean>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string>('v_01');
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [gourmetFilter, setGourmetFilter]     = useState<'all' | 'veg' | 'nonveg'>('all');
  const [savedPulse, setSavedPulse]           = useState(false);
  const { toasts, show: showToast }           = useToast();

  // ── Persist to localStorage on every stateMap change ──
  useEffect(() => {
    saveToStorage(stateMap);
  }, [stateMap]);

  // ── Handlers ──
  const handleToggleState = useCallback((id: string) => {
    setStateMap(prev => {
      const next = { ...prev, [id]: cycleState(prev[id] ?? 'pending') };
      return next;
    });
  }, []);

  const handleToggleOpen = useCallback((id: string) => {
    setOpenMap(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  const handleReset = useCallback(() => {
    setStateMap(defaultMap);
    saveToStorage(defaultMap);
    showToast('Checklist reset to defaults', 'warning');
  }, [defaultMap, showToast]);

  const handleSave = useCallback(() => {
    saveToStorage(stateMap);
    setSavedPulse(true);
    showToast('Progress saved to local storage ✓', 'success');
    setTimeout(() => setSavedPulse(false), 1500);
  }, [stateMap, showToast]);

  const handleGourmetAction = useCallback((action: string, name: string) => {
    if (action === 'Book Table')      showToast(`Table booked at ${name} 🍽️`, 'success');
    else if (action === 'Order Delivery') showToast(`Order placed from ${name} 🛵`, 'info');
    else if (action === 'Track Order')    showToast('Tracking your order...', 'info');
    else showToast(`Opening menu for ${name}`, 'info');
  }, [showToast]);

  const handleVehicleSelect = useCallback((id: string, type: string) => {
    setSelectedVehicle(id);
    showToast(`${type} selected for rental`, 'info');
  }, [showToast]);

  // ── Derived ──
  const filteredGourmet = tripData.gourmetSelections.filter(g =>
    gourmetFilter === 'all' ? true :
    gourmetFilter === 'veg' ? g.type === 'veg' :
    g.type === 'nonveg' || g.type === 'both'
  );

  // ── Sidebar inner content (reused in drawer + desktop) ──
  const SidebarInner = () => (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Destination header */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <h2 className="text-base font-bold text-zinc-100">{tripData.destination}</h2>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{tripData.tagline}</p>
      </div>

      {/* Weather widget */}
      <WeatherWidget weather={tripData.weather} destination={tripData.destination} />

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        <ChecklistSummary stateMap={stateMap} items={tripData.checklistItems} />
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trip Checklist</p>
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              title="Save progress"
              className={`p-1.5 rounded-lg transition-all ${savedPulse ? 'bg-emerald-600/30 text-emerald-400' : 'hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset checklist"
              className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {tripData.checklistItems.map(item => (
          <TreeNode
            key={item.id} item={item} depth={0}
            stateMap={stateMap} onToggleState={handleToggleState}
            openMap={openMap} onToggleOpen={handleToggleOpen}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-zinc-800/80">
        <p className="text-xs text-zinc-700 text-center">
          Auto-saved · Click item to cycle state
        </p>
      </div>
    </div>
  );

  return (
    <div id="tn-dashboard-modular" className="min-h-screen bg-[#121212] text-zinc-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Toast layer ── */}
      <ToastContainer toasts={toasts} />

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Menu className="w-4 h-4 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight leading-none">
              <span className="text-indigo-400">Trip</span>
              <span className="text-white">Nexus</span>
              <span className="ml-2 text-sm font-normal text-zinc-500 hidden sm:inline">
                — {tripData.destination} Travel Guide
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{tripData.weather.icon}</span>
          <span className="text-sm font-semibold text-zinc-300">{tripData.weather.temp}°C</span>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-700/50 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#1A1A1A] border-r border-zinc-800 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
                <span className="text-sm font-bold text-zinc-200">Trip Checklist</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-700 transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarInner />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── 12-col Layout ── */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-12 min-h-[calc(100vh-57px)]">

        {/* Desktop Sidebar — col 1–3 */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col border-r border-zinc-800 bg-[#161616] sticky top-[57px] h-[calc(100vh-57px)] overflow-hidden">
          <SidebarInner />
        </aside>

        {/* Content Panel — col 4–12 */}
        <main className="col-span-12 lg:col-span-9 overflow-y-auto
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-4 md:p-6 space-y-10">

            {/* ── LOCAL GEMS ── */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                <h2 className="text-lg font-bold text-zinc-100">Local Gems</h2>
                <span className="text-xs text-zinc-600 ml-1 hidden sm:inline">
                  — Hidden treasures of {tripData.destination}
                </span>
                <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-1 rounded-lg">
                  {tripData.localGems.length} spots
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tripData.localGems.map(gem => <GemCard key={gem.id} gem={gem} />)}
              </div>
            </section>

            {/* ── LOGISTICS ── */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                <h2 className="text-lg font-bold text-zinc-100">Logistics & Fleet</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Sample Stay */}
                <div className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Hotel className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-zinc-200">Sample Stay</h3>
                    <span className="ml-auto text-xs text-zinc-600">{tripData.logistics.stays.length} options</span>
                  </div>
                  <div className="space-y-3">
                    {tripData.logistics.stays.map(stay => <StayCard key={stay.id} stay={stay} />)}
                  </div>
                </div>

                {/* Vehicle Rental */}
                <div className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-zinc-200">Vehicle Rental</h3>
                    <span className="ml-auto text-xs text-zinc-600">Select your ride</span>
                  </div>
                  <div className="space-y-2">
                    {tripData.logistics.vehicles.map(v => (
                      <VehicleRow
                        key={v.id} vehicle={v}
                        selected={selectedVehicle === v.id}
                        onSelect={() => v.available && handleVehicleSelect(v.id, v.type)}
                      />
                    ))}
                  </div>
                  <AnimatePresence>
                    {selectedVehicle && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        onClick={() => {
                          const v = tripData.logistics.vehicles.find(x => x.id === selectedVehicle);
                          showToast(`${v?.type} booking confirmed! 🎉`, 'success');
                        }}
                        className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.98]"
                      >
                        Confirm Rental Booking
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* ── GOURMET SECTION ── */}
            <section>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-amber-500 rounded-full" />
                  <h2 className="text-lg font-bold text-zinc-100">Gourmet Selections</h2>
                </div>
                {/* Veg / Non-Veg filter */}
                <div className="ml-auto flex items-center gap-1 bg-zinc-800/80 rounded-xl p-1 border border-zinc-700/40">
                  {(['all', 'veg', 'nonveg'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setGourmetFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        gourmetFilter === f
                          ? f === 'veg'    ? 'bg-emerald-600 text-white shadow'
                          : f === 'nonveg' ? 'bg-red-600 text-white shadow'
                          :                  'bg-zinc-600 text-white shadow'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {f === 'all'    ? 'All' :
                       f === 'veg'    ? <span className="flex items-center gap-1"><Leaf className="w-3 h-3" />Veg</span> :
                                        <span className="flex items-center gap-1"><Drumstick className="w-3 h-3" />Non-Veg</span>}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredGourmet.map(card => (
                    <motion.div
                      key={card.id} layout
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.18 }}
                    >
                      <GourmetCard card={card} onAction={handleGourmetAction} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-zinc-800/60 pt-6 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-zinc-700">
                  TripNexus · {tripData.destination} Guide · State persisted in localStorage
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />Save Progress
                  </button>
                  <span className="text-zinc-700">·</span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />Reset
                  </button>
                </div>
              </div>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
