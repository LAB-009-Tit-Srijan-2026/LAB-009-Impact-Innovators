'use client';
import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { TripPlanForm } from '@/components/dashboard/TripPlanForm';
import { DestinationCard } from '@/components/dashboard/DestinationCard';
import { DestinationModal } from '@/components/dashboard/DestinationModal';
import { PriceTrendsChart } from '@/components/dashboard/PriceTrendsChart';
import { CrowdHeatmap } from '@/components/dashboard/CrowdHeatmap';
import { SmartAlerts } from '@/components/dashboard/SmartAlerts';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { destinations } from '@/lib/dummy-data';
import { Compass, Search, X, CloudSun, Map } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const IndiaMap = dynamic(() => import('@/components/ui/IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center" style={{ height: '480px' }}>
      <p className="text-gray-400 text-sm">Map load ho raha hai...</p>
    </div>
  ),
});

const filters = ['Sab', 'Heritage', 'Beach', 'Mountains', 'Nature', 'Spiritual', 'Adventure', 'Offbeat', 'Wildlife', 'Pilgrimage', 'Culture', 'Desert'];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('Sab');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  const filtered = destinations.filter((d) => {
    const matchFilter = activeFilter === 'Sab' || d.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  function clearSearch() {
    setSearchQuery('');
    router.replace('/dashboard');
  }

  return (
    <AppLayout>
      <HeroSection />
      <TripPlanForm />

      {/* Recommended Destinations */}
      <div className="mt-8" id="destinations-section">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Top Indian Destinations 🇮🇳</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Search className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-36" />
              {searchQuery && <button onClick={clearSearch}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
            </div>
            <div className="flex gap-1 bg-purple-50 rounded-xl p-1 flex-wrap">
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === f ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchQuery && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">
              <span className="font-medium text-purple-700">"{searchQuery}"</span> ke liye{' '}
              <span className="font-semibold">{filtered.length}</span> result mila
            </span>
            <button onClick={clearSearch} className="text-xs text-purple-500 hover:underline">Clear</button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-purple-50 shadow-sm">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-600 font-semibold text-lg">Koi destination nahi mila</p>
            <p className="text-sm text-gray-400 mt-1">"{searchQuery}" se koi match nahi hua</p>
            <button onClick={clearSearch} className="mt-4 px-4 py-2 text-sm text-white rounded-xl font-medium"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              Sab destinations dekho
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((dest, i) => (
              <DestinationCard key={dest.id} destination={dest} index={i} onClick={() => setSelectedDest(dest)} />
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">India Destinations Map 🗺️</h2>
          <span className="text-xs text-gray-400 ml-1">— Pin click karo destination details ke liye</span>
        </div>
        <IndiaMap destinations={destinations} height="480px" onDestinationClick={(dest) => setSelectedDest(dest)} />
      </div>

      {/* Weather */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CloudSun className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-800">Live Weather — Indian Cities 🌤️</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {['Delhi', 'Mumbai', 'Jaipur', 'Manali', 'Goa', 'Kerala', 'Ladakh', 'Bangalore', 'Chennai', 'Nainital'].map(city => (
            <WeatherWidget key={city} city={city} variant="full" className="rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
        <div className="lg:col-span-2"><PriceTrendsChart /></div>
        <CrowdHeatmap />
      </div>
      <div className="mt-5"><SmartAlerts /></div>

      {selectedDest && <DestinationModal destination={selectedDest} onClose={() => setSelectedDest(null)} />}
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
