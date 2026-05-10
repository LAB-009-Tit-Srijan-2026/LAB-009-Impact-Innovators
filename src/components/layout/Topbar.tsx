'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getGreeting } from '@/lib/utils';
import { destinations } from '@/lib/dummy-data';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { WeatherWidget } from '@/components/ui/WeatherWidget';

export function Topbar() {
  const { user, notifications, markAllRead, theme, toggleTheme, sidebarOpen, setUser, setAuthenticated } = useAppStore();
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [time, setTime]               = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  const unread = notifications.filter((n) => !n.read).length;

  // Search results — filter destinations by name, state, tags
  const searchResults = searchQuery.trim().length > 1
    ? destinations.filter((d) => {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          d.description.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  }

  function handleResultClick(destName: string) {
    setSearchQuery(destName);
    setShowResults(false);
    router.push(`/dashboard?search=${encodeURIComponent(destName)}`);
  }

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 bg-white/85 backdrop-blur-xl border-b border-purple-100 flex items-center px-6 gap-4 transition-all duration-300"
      style={{ left: sidebarOpen ? 240 : 72 }}
    >
      {/* Greeting */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">
          {getGreeting()},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]} ji</span> 🙏
        </p>
        <p className="text-xs text-gray-400">{format(time, 'EEEE, d MMMM yyyy • HH:mm:ss')}</p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="hidden md:block relative w-56">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="Destination dhundho..."
              className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-full"
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setShowResults(false); }}>
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </form>

        {/* Dropdown results */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-purple-100 overflow-hidden z-50"
            >
              {searchResults.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleResultClick(dest.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors text-left"
                >
                  <img src={dest.image} alt={dest.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{dest.name}</p>
                    <p className="text-xs text-gray-400">{dest.tags.slice(0, 2).join(' · ')}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSearchSubmit as any}
                className="w-full px-3 py-2 text-xs text-purple-600 hover:bg-purple-50 transition-colors text-left border-t border-purple-50 font-medium"
              >
                "{searchQuery}" ke liye sab results dekho →
              </button>
            </motion.div>
          )}
          {showResults && searchQuery.trim().length > 1 && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-purple-100 z-50 px-3 py-4 text-center"
            >
              <p className="text-sm text-gray-400">Koi destination nahi mila 🔍</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weather — live from OpenWeatherMap */}
      <WeatherWidget city="Delhi" variant="topbar" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center hover:bg-purple-100 transition-colors"
      >
        {theme === 'light'
          ? <Moon className="w-4 h-4 text-purple-500" />
          : <Sun className="w-4 h-4 text-amber-500" />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
          className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center hover:bg-purple-100 transition-colors relative"
        >
          <Bell className="w-4 h-4 text-purple-500" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-50">
                <h3 className="font-semibold text-gray-800">Notifications 🔔</h3>
                <button onClick={markAllRead} className="text-xs text-purple-600 hover:underline">Sab padha</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-purple-50/50 transition-colors ${!n.read ? 'bg-purple-50/30' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-purple-500' : 'bg-gray-300'}`} />
                      <p className="text-sm text-gray-700">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
          className="flex items-center gap-2 hover:bg-purple-50 rounded-xl px-2 py-1.5 transition-colors"
        >
          <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-xl object-cover ring-2 ring-purple-100" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.location}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-purple-50" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(219,39,119,0.04))' }}>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                  <span>🗺️ {user?.statesVisited} states</span>
                  <span>✈️ {user?.tripsCount} trips</span>
                </div>
              </div>
              <div className="py-1">
                {['Profile', 'Settings', 'Help'].map((item) => (
                  <button key={item}
                    onClick={() => { setShowProfile(false); router.push(`/${item.toLowerCase()}`); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors">
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowProfile(false);
                    setUser(null);
                    setAuthenticated(false);
                    router.replace('/login');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-50 mt-1">
                  🚪 Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
