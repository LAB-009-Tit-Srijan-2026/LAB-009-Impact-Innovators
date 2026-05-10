'use client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Star, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getGreeting } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const stats = [
  { label: 'Indian Destinations', value: '500+', icon: MapPin,      color: 'from-orange-500 to-red-500'    },
  { label: 'Happy Travelers',     value: '2L+',  icon: Star,        color: 'from-purple-500 to-pink-600'   },
  { label: 'AI Itineraries',      value: '5L+',  icon: Sparkles,    color: 'from-amber-500 to-orange-500'  },
  { label: 'Avg Bachat',          value: '35%',  icon: TrendingUp,  color: 'from-emerald-500 to-teal-600'  },
];

export function HeroSection() {
  const { user } = useAppStore();
  const router   = useRouter();

  return (
    <div className="relative overflow-hidden rounded-3xl mb-6"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 40%, #f59e0b 100%)' }}>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            className="absolute w-2 h-2 bg-white/50 rounded-full"
            style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 4) * 20}%` }} />
        ))}
      </div>

      <div className="relative z-10 p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm">🇮🇳</span>
              <span className="text-white/90 text-xs font-medium">Incredible India — AI Travel Planner</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {getGreeting()},{' '}
            <span className="text-yellow-300">{user?.name?.split(' ')[0]} ji!</span>
            <br />
            <span className="text-white/90">Kahan Jaana Hai? 🗺️</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-white/80 text-sm lg:text-base max-w-md">
            Rajasthan ke forts se Ladakh ki pahaadiyon tak, Kerala ke backwaters se Goa ke beaches tak — AI se banao apna perfect Indian trip! 🏔️🏖️
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mt-5 flex-wrap">
            <button onClick={() => router.push('/plan')}
              className="bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors shadow-lg text-sm">
              🚀 Trip Plan Karo
            </button>
            <button onClick={() => { const el = document.getElementById('destinations-section'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="bg-white/20 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors text-sm border border-white/30">
              🗺️ Destinations Dekho
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-4">
            <div className="flex rounded-full overflow-hidden h-1.5 w-16">
              <div className="flex-1 bg-orange-400" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-green-500" />
            </div>
            <span className="text-white/60 text-xs">Jai Hind 🙏</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:w-72">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-white/70 text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
