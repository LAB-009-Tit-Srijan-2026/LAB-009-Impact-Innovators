'use client';
import { useAppStore } from '@/store/useAppStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

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
