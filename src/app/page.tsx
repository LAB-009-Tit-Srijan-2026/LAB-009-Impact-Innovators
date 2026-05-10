'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();

  useEffect(() => {
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
      <div className="text-center text-white">
        <div className="text-5xl mb-4">🇮🇳</div>
        <p className="text-xl font-bold">TripNexus</p>
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mt-3" />
      </div>
    </div>
  );
}
