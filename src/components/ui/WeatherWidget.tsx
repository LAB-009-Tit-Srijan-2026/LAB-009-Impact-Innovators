'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Wind, Eye, Thermometer, RefreshCw, X } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

interface WeatherWidgetProps {
  city?: string;
  variant?: 'topbar' | 'card' | 'full';
  className?: string;
}

// Condition → gradient background
const conditionBg: Record<string, string> = {
  Clear:        'from-amber-400 to-orange-500',
  Clouds:       'from-slate-400 to-gray-500',
  Rain:         'from-blue-500 to-indigo-600',
  Drizzle:      'from-blue-400 to-cyan-500',
  Thunderstorm: 'from-purple-600 to-gray-700',
  Snow:         'from-blue-200 to-slate-400',
  Mist:         'from-gray-400 to-slate-500',
  Haze:         'from-yellow-400 to-orange-400',
  Smoke:        'from-gray-500 to-zinc-600',
};

export function WeatherWidget({ city = 'Delhi', variant = 'topbar', className = '' }: WeatherWidgetProps) {
  const { weather, loading, isMock, refetch } = useWeather(city);
  const [showDetail, setShowDetail] = useState(false);

  const bg = conditionBg[weather?.condition ?? ''] ?? 'from-blue-400 to-indigo-500';

  // ── TOPBAR: compact pill, click → popup ──────────────────────────────────
  if (variant === 'topbar') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDetail(p => !p)}
          className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl px-3 py-2 hover:from-orange-100 hover:to-amber-100 transition-colors"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-orange-300 border-t-transparent animate-spin" />
          ) : (
            <span className="text-lg leading-none">{weather?.emoji ?? '🌡️'}</span>
          )}
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-700 leading-none">
              {loading ? '...' : `${weather?.temp ?? '--'}°C`}
            </p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">{weather?.city ?? city}</p>
          </div>
          <div className="flex items-center gap-1 ml-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-gray-500">{loading ? '--' : `${weather?.humidity}%`}</span>
          </div>
          {isMock && <span className="text-xs text-orange-400 ml-1" title="Estimated">~</span>}
        </button>

        <AnimatePresence>
          {showDetail && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDetail(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden"
              >
                {loading ? (
                  <div className="p-6 text-center">
                    <span className="w-6 h-6 rounded-full border-2 border-orange-300 border-t-transparent animate-spin inline-block" />
                    <p className="text-sm text-gray-400 mt-2">Loading weather...</p>
                  </div>
                ) : weather ? (
                  <DetailPopup weather={weather} isMock={isMock} bg={bg} onRefresh={refetch} onClose={() => setShowDetail(false)} />
                ) : null}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── CARD: dark sidebar card (Nainital dashboard) ──────────────────────────
  if (variant === 'card') {
    if (loading) {
      return (
        <div className={`p-3 rounded-xl bg-gradient-to-br from-indigo-900/40 to-blue-900/30 border border-indigo-700/30 animate-pulse ${className}`}>
          <div className="h-16 rounded-lg bg-white/10" />
        </div>
      );
    }
    if (!weather) return null;
    return (
      <div className={`p-3 rounded-xl bg-gradient-to-br from-indigo-900/40 to-blue-900/30 border border-indigo-700/30 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">
              {weather.city} Weather
              {isMock && <span className="text-orange-400 ml-1">(~est)</span>}
            </p>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold text-zinc-100">{weather.temp}°C</span>
              <span className="text-xs text-zinc-400 mb-0.5 capitalize">{weather.description}</span>
            </div>
          </div>
          <span className="text-3xl">{weather.emoji}</span>
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Droplets className="w-3 h-3 text-blue-400" />{weather.humidity}%
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Wind className="w-3 h-3 text-zinc-400" />{weather.wind} km/h
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Thermometer className="w-3 h-3 text-red-400" />Feels {weather.feels_like}°C
          </span>
        </div>
      </div>
    );
  }

  // ── FULL: dashboard city grid card ───────────────────────────────────────
  if (loading) {
    return (
      <div className={`rounded-2xl overflow-hidden border border-gray-100 animate-pulse ${className}`}>
        <div className="h-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="p-3 bg-white space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Always show something — use mock if real data unavailable
  const w = weather ?? {
    city, country: 'IN', temp: '--' as any, feels_like: '--' as any,
    condition: 'Clear', description: 'loading...', humidity: '--' as any,
    wind: '--' as any, visibility: 10, icon: '', emoji: '🌡️',
    sunrise: '--', sunset: '--', updatedAt: '',
  };

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${conditionBg[w.condition] ?? 'from-blue-400 to-indigo-500'} p-3 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold opacity-90 truncate">{w.city}</p>
            <p className="text-2xl font-bold mt-0.5">{w.temp}°C</p>
          </div>
          <div className="text-right">
            <span className="text-2xl">{w.emoji}</span>
            {isMock && <p className="text-xs opacity-60 mt-0.5">~est</p>}
          </div>
        </div>
        <p className="text-xs opacity-75 mt-1 capitalize">{w.description}</p>
      </div>
      {/* Stats */}
      <div className="bg-white p-3 grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span className="text-xs text-gray-600">{w.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3 h-3 text-teal-400 flex-shrink-0" />
          <span className="text-xs text-gray-600">{w.wind} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3 h-3 text-red-400 flex-shrink-0" />
          <span className="text-xs text-gray-600">Feels {w.feels_like}°C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-gray-600">{w.visibility} km</span>
        </div>
      </div>
    </div>
  );
}

// ── Detail popup (topbar click) ───────────────────────────────────────────────
function DetailPopup({ weather, isMock, bg, onRefresh, onClose }: {
  weather: NonNullable<ReturnType<typeof useWeather>['weather']>;
  isMock: boolean;
  bg: string;
  onRefresh: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className={`bg-gradient-to-br ${bg} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold opacity-90">{weather.city}, {weather.country}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-bold">{weather.temp}°C</span>
              <span className="text-sm opacity-80 mb-1 capitalize">{weather.description}</span>
            </div>
            <p className="text-xs opacity-70 mt-1">Feels like {weather.feels_like}°C</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-4xl">{weather.emoji}</span>
            <div className="flex gap-1">
              <button onClick={onRefresh} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors" title="Refresh">
                <RefreshCw className="w-3 h-3" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors" title="Close">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {[
          { icon: Droplets,    label: 'Humidity',   value: `${weather.humidity}%`,    color: 'text-blue-500'   },
          { icon: Wind,        label: 'Wind',        value: `${weather.wind} km/h`,    color: 'text-teal-500'   },
          { icon: Eye,         label: 'Visibility',  value: `${weather.visibility} km`,color: 'text-purple-500' },
          { icon: Thermometer, label: 'Feels Like',  value: `${weather.feels_like}°C`, color: 'text-red-500'    },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
            <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-700">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-amber-50 rounded-xl p-2.5">
          <span className="text-lg">🌅</span>
          <div>
            <p className="text-xs text-gray-400">Sunrise</p>
            <p className="text-sm font-semibold text-gray-700">{weather.sunrise}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-indigo-50 rounded-xl p-2.5">
          <span className="text-lg">🌇</span>
          <div>
            <p className="text-xs text-gray-400">Sunset</p>
            <p className="text-sm font-semibold text-gray-700">{weather.sunset}</p>
          </div>
        </div>
      </div>

      {isMock && (
        <p className="text-center text-xs text-orange-400 pb-3 px-4">
          ~ Estimated · Add OPENWEATHER_API_KEY for live data
        </p>
      )}
    </div>
  );
}
