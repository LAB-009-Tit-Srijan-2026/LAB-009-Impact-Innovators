'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard'); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
      <div className="text-center text-white">
        <div className="text-5xl mb-4">🇮🇳</div>
        <p className="text-xl font-bold">TripNexus</p>
        <p className="text-sm opacity-80 mt-1">Loading...</p>
      </div>
    </div>
  );
}
