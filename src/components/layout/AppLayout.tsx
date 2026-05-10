'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, isAuthenticated } = useAppStore();
  const router   = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-80">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mandala-bg" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #fff7ed 100%)' }}>
      <Sidebar />
      <Topbar />
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
