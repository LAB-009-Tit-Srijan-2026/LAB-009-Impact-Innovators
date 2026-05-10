'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { bookings as initialBookings } from '@/lib/dummy-data';
import { formatCurrencyFull, formatDate } from '@/lib/utils';
import { Hotel, Plane, Activity, Search, QrCode, Download, X, Star, Calendar, Users, FileText, AlertTriangle, Check } from 'lucide-react';

const tabs = [
  { id: 'all',      label: 'Sab',        emoji: '📋' },
  { id: 'hotel',    label: 'Hotels',     emoji: '🏨' },
  { id: 'flight',   label: 'Flights',    emoji: '✈️' },
  { id: 'activity', label: 'Activities', emoji: '🎯' },
];

const statusConfig = {
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmed ✅' },
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Pending ⏳'   },
  cancelled: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Cancelled ❌' },
};

// Simple deterministic QR pattern from booking ref
function QRPattern({ seed }: { seed: string }) {
  const cells = Array.from({ length: 25 }, (_, i) => {
    const c = seed.charCodeAt(i % seed.length);
    return (c + i * 7) % 3 !== 0;
  });
  return (
    <div className="grid grid-cols-5 gap-1 p-3">
      {cells.map((filled, i) => (
        <div key={i} className={`w-6 h-6 rounded-sm ${filled ? 'bg-purple-800' : 'bg-white'}`} />
      ))}
    </div>
  );
}

function QRModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  function downloadTicket() {
    const content = [
      `╔══════════════════════════════╗`,
      `║   TripNexus Travel Ticket    ║`,
      `╚══════════════════════════════╝`,
      ``,
      `Booking: ${booking.bookingRef}`,
      `Name:    ${booking.name}`,
      `Dest:    ${booking.destination}`,
      `Check-in: ${formatDate(booking.checkIn)}`,
      `Check-out: ${formatDate(booking.checkOut)}`,
      `Guests:  ${booking.guests}`,
      `Amount:  ₹${booking.amount.toLocaleString('en-IN')}`,
      `Status:  ${booking.status.toUpperCase()}`,
      ``,
      `🇮🇳 Incredible India — TripNexus`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ticket_${booking.bookingRef}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 w-80 text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-800 mb-1">{booking.name}</h3>
        <p className="text-sm text-gray-500 mb-1">{booking.bookingRef}</p>
        <p className="text-xs text-purple-600 font-medium mb-4">🇮🇳 India Travel Ticket</p>
        <div className="w-48 h-48 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-purple-200">
          <QRPattern seed={booking.bookingRef} />
        </div>
        <p className="text-xs text-gray-400 mb-4">Check-in ke waqt ye QR dikhao</p>
        <button onClick={downloadTicket}
          className="w-full text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <Download className="w-4 h-4" /> Ticket Download Karo
        </button>
      </motion.div>
    </motion.div>
  );
}

function CancelModal({ booking, onClose, onConfirm }: { booking: any; onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Booking Cancel Karo?</h3>
            <p className="text-xs text-gray-500 mt-0.5">{booking.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">Kya aap sure hain? Cancellation policy ke hisaab se refund milega.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
            Nahi, Rakho
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
            Haan, Cancel Karo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BookingCard({ booking, index, onCancel }: { booking: any; index: number; onCancel: (id: string) => void }) {
  const [showQR, setShowQR]         = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [toast, setToast]           = useState('');
  const TypeIcon = booking.type === 'hotel' ? Hotel : booking.type === 'flight' ? Plane : Activity;
  const sc = statusConfig[booking.status as keyof typeof statusConfig];

  function downloadInvoice() {
    const content = [
      `INVOICE — TripNexus`,
      `===================`,
      `Ref:      ${booking.bookingRef}`,
      `Service:  ${booking.name}`,
      `Dest:     ${booking.destination}`,
      `Date:     ${formatDate(booking.checkIn)}`,
      `Guests:   ${booking.guests}`,
      `Amount:   ₹${booking.amount.toLocaleString('en-IN')}`,
      `Status:   ${booking.status.toUpperCase()}`,
      ``,
      `Thank you for choosing TripNexus 🇮🇳`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `invoice_${booking.bookingRef}.txt`;
    a.click(); URL.revokeObjectURL(url);
    setToast('📄 Invoice downloaded!');
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-6 z-50 bg-white border border-purple-200 rounded-2xl px-4 py-2.5 shadow-xl text-sm font-medium text-gray-800">
          {toast}
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="bg-white rounded-3xl overflow-hidden shadow-card border border-purple-50 flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0 overflow-hidden">
          <img src={booking.image} alt={booking.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <TypeIcon className="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-800">{booking.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1"><span>🇮🇳</span>{booking.destination}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-purple-400" />
              {formatDate(booking.checkIn)}{booking.checkIn !== booking.checkOut && ` → ${formatDate(booking.checkOut)}`}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4 text-purple-400" />{booking.guests} log
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <span className="text-purple-600">₹</span>{booking.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors">
              <QrCode className="w-3.5 h-3.5" /> Ticket Dekho
            </button>
            <button onClick={downloadInvoice}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
              <FileText className="w-3.5 h-3.5" /> Invoice
            </button>
            {booking.status === 'confirmed' && (
              <button onClick={() => setShowCancel(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors ml-auto">
                Cancel Karo
              </button>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showQR && <QRModal booking={booking} onClose={() => setShowQR(false)} />}
        {showCancel && (
          <CancelModal booking={booking} onClose={() => setShowCancel(false)}
            onConfirm={() => { onCancel(booking.id); setShowCancel(false); setToast('✅ Booking cancelled. Refund 5-7 days mein milega.'); setTimeout(() => setToast(''), 4000); }} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab]   = useState('all');
  const [search, setSearch]         = useState('');
  const [bookings, setBookings]     = useState(initialBookings);

  function handleCancel(id: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  }

  const filtered = bookings.filter(b => {
    const matchTab    = activeTab === 'all' || b.type === activeTab;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.destination.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalSpent = bookings.reduce((s, b) => s + b.amount, 0);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bookings 📋</h1>
          <p className="text-sm text-gray-500 mt-1">Saari bookings ek jagah manage karo</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bookings', value: bookings.length,                                    color: 'text-purple-600' },
          { label: 'Confirmed',      value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-emerald-600' },
          { label: 'Pending',        value: bookings.filter(b => b.status === 'pending').length,   color: 'text-amber-600'  },
          { label: 'Total Kharch',   value: `₹${totalSpent.toLocaleString('en-IN')}`,             color: 'text-pink-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-card border border-purple-50">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-purple-50 rounded-2xl p-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-purple-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Booking dhundho..."
            className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-full" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
      </div>
      <div className="space-y-4">
        {filtered.map((booking, i) => (
          <BookingCard key={booking.id} booking={booking} index={i} onCancel={handleCancel} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-purple-50">
            <Search className="w-12 h-12 text-purple-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Koi booking nahi mili</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
