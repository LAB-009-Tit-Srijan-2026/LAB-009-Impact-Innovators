'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { TripPlanForm } from '@/components/dashboard/TripPlanForm';
import { DestinationCard } from '@/components/dashboard/DestinationCard';
import { DestinationModal } from '@/components/dashboard/DestinationModal';
import { PriceTrendsChart } from '@/components/dashboard/PriceTrendsChart';
import { CrowdHeatmap } from '@/components/dashboard/CrowdHeatmap';
import { SmartAlerts } from '@/components/dashboard/SmartAlerts';
import { destinations } from '@/lib/dummy-data';
import { Compass, SlidersHorizontal } from 'lucide-react';

const filters = ['Sab', 'Heritage', 'Beach', 'Mountains', 'Nature', 'Spiritual', 'Adventure'];

export default function DashboardPage() {
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('Sab');

  const filtered = activeFilter === 'Sab'
    ? destinations
    : destinations.filter((d) => d.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase()));

  return (
    <AppLayout>
      <HeroSection />
      <TripPlanForm />

      {/* Recommended Destinations */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Top Indian Destinations 🇮🇳</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-purple-50 rounded-xl p-1 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === f
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((dest, i) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              index={i}
              onClick={() => setSelectedDest(dest)}
            />
          ))}
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
        <div className="lg:col-span-2">
          <PriceTrendsChart />
        </div>
        <CrowdHeatmap />
      </div>

      <div className="mt-5">
        <SmartAlerts />
      </div>

      {selectedDest && (
        <DestinationModal destination={selectedDest} onClose={() => setSelectedDest(null)} />
      )}
    </AppLayout>
  );
}
