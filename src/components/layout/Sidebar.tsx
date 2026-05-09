'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Bot, Briefcase, CalendarCheck,
  Bell, Users, Settings, ChevronLeft, ChevronRight, Plane,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard, emoji: '🏠' },
  { href: '/plan',       label: 'Trip Banao',     icon: Map,             emoji: '🗺️' },
  { href: '/assistant',  label: 'AI Dost',        icon: Bot,             emoji: '🤖' },
  { href: '/trips',      label: 'Meri Trips',     icon: Briefcase,       emoji: '✈️' },
  { href: '/bookings',   label: 'Bookings',       icon: CalendarCheck,   emoji: '📋' },
  { href: '/alerts',     label: 'Alerts',         icon: Bell,            emoji: '🔔' },
  { href: '/community',  label: 'Community',      icon: Users,           emoji: '👥' },
  { href: '/settings',   label: 'Settings',       icon: Settings,        emoji: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, user } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col bg-white border-r border-purple-100 shadow-sm overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-purple-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <span className="text-lg">🇮🇳</span>
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <p className="font-bold text-lg gradient-text whitespace-nowrap leading-none">TripNexus</p>
              <p className="text-xs text-gray-400 whitespace-nowrap">Incredible India 🙏</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, emoji }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'text-purple-700 border-r-2 border-purple-500'
                    : 'text-gray-500 hover:bg-purple-50 hover:text-gray-800'
                )}
                style={active ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(219,39,119,0.06))' } : {}}
              >
                <span className="text-base flex-shrink-0 w-5 text-center">{emoji}</span>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn('text-sm font-medium whitespace-nowrap', active ? 'text-purple-700' : '')}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && sidebarOpen && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-purple-100">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0 ring-2 ring-purple-100"
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.location}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-purple-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-50"
      >
        {sidebarOpen
          ? <ChevronLeft className="w-3 h-3 text-purple-500" />
          : <ChevronRight className="w-3 h-3 text-purple-500" />}
      </button>
    </motion.aside>
  );
}
