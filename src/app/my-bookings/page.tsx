'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookingsStore } from '@/store/useBookingsStore';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import {
  Calendar, MapPin, IndianRupee, Users, QrCode, Download,
  X, AlertTriangle, Search, Filter, Sparkles, CheckCircle2,
  Clock, XCircle, FileText
} from 'lucide-react';

const statusConfig = {
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmed ✅', icon: CheckCircle2 },
  completed: { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Completed 🏁', icon: CheckCircle2 },
  cancelled: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Cancelled ❌', icon: XCircle },
};

const catEmoji: Record<string, string> = {
  stay: '🏡', food: '🍛', experience: '🎒', transport: '🚗', guide: '🧭', shop: '🛍️',
};

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

function TicketModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  function download() {
    const content = [
      `╔══════════════════════════════╗`,
      `║   TripNexus Booking Ticket   ║`,
      `╚══════════════════════════════╝`,
      ``,
      `Ref:      ${booking.id}`,
      `Service:  ${booking.listingTitle}`,
      `Category: ${booking.listingCategory}`,
      `Location: ${booking.listingLocation}`,
      `Date:     ${booking.date}`,
      `Travelers: ${booking.travelers.join(', ')}`,
      `Amount:   ₹${booking.finalPrice.toLocaleString()}`,
      `Payment:  ${booking.paymentMethod.toUpperCase()}`,
      `Status:   ${booking.status.toUpperCase()}`,
      `Booked:   ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`,
      ``,
      `🇮🇳 Incredible India — TripNexus`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ticket_${booking.id}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 w-80 text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-2xl mb-1">{catEmoji[booking.listingCategory] ?? '��'}</div>
        <h3 className="font-bold text-gray-800 mb-1 text-sm">{booking.listingTitle}</h3>
        <p className="text-xs text-gray-500 mb-1">{booking.id}</p>
        <p className="text-xs text-purple-600 font-medium mb-4">🇮🇳 TripNexus Booking</p>
        <div className="w-48 h-48 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-purple-200">
          <QRPattern seed={booking.id} />
        </div>
        <p className="text-xs text-gray-400 mb-4">Show this at check-in</p>
        <button onClick={download}
          className="w-full text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <Download className="w-4 h-4" /> Download Ticket
        </button>
      </motion.div>
    </motion.div>
  );
}

function CancelModal({ booking, onClose, onConfirm }: { booking: any; onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Cancel Booking?</h3>
            <p className="text-xs text-gray-500 mt-0.5">{booking.listingTitle}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">Refund 5–7 business days mein process hoga.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
            Nahi, Rakho
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
            Haan, Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { bookings, cancelBooking, stats } = useBookingsStore();
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [ticketBooking, setTicketBooking] = useState<any>(null);
  const [cancelTarget, setCancelTarget]   = useState<any>(null);
  const [toast, setToast]         = useState('');

  const userId = user?.id ?? 'demo';
  const userBookings = bookings.filter(b => b.userId === userId);
  const s = stats(userId);

  const filtered = userBookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search ||
      b.listingTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.listingLocation.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function handleCancel(id: string) {
    cancelBooking(id);
    setCancelTarget(null);
    setToast('✅ Booking cancelled. Refund 5–7 days mein milega.');
    setTimeout(() => setToast(''), 4000);
  }

  function downloadInvoice(b: any) {
    const content = [
      `INVOICE — TripNexus`,
      `===================`,
      `Ref:       ${b.id}`,
      `Service:   ${b.listingTitle}`,
      `Location:  ${b.listingLocation}`,
      `Date:      ${b.date}`,
      `Travelers: ${b.travelers.join(', ')}`,
      `Original:  ₹${b.originalPrice.toLocaleString()}`,
      `Discount:  ${b.discountPct}%${b.couponCode ? ` (${b.couponCode})` : ''}`,
      `Final:     ₹${b.finalPrice.toLocaleString()}`,
      `Per Person:₹${b.perPerson.toLocaleString()}`,
      `Payment:   ${b.paymentMethod.toUpperCase()}`,
      `Status:    ${b.status.toUpperCase()}`,
      `Booked on: ${new Date(b.createdAt).toLocaleDateString('en-IN')}`,
      ``,
      `Thank you for choosing TripNexus 🇮🇳`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `invoice_${b.id}.txt`;
    a.click(); URL.revokeObjectURL(url);
    setToast('📄 Invoice downloaded!');
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <AppLayout>
      <AnimatePresence>
        {ticketBooking && <TicketModal booking={ticketBooking} onClose={() => setTicketBooking(null)} />}
        {cancelTarget  && <CancelModal booking={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={() => handleCancel(cancelTarget.id)} />}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 bg-white border border-purple-200 rounded-2xl px-5 py-3 shadow-xl text-sm font-medium text-gray-800">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Bookings ��</h1>
          <p className="text-sm text-gray-500 mt-1">Saari bookings ek jagah — locally saved</p>
        </div>
        <button onClick={() => router.push('/explore-local')}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          + New Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total',     value: s.total,                          color: 'text-purple-600' },
          { label: 'Confirmed', value: s.confirmed,                      color: 'text-emerald-600' },
          { label: 'Completed', value: s.completed,                      color: 'text-blue-600'   },
          { label: 'Cancelled', value: s.cancelled,                      color: 'text-red-500'    },
          { label: 'Total Spent', value: `₹${s.totalSpent.toLocaleString()}`, color: 'text-pink-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50">
            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-purple-50 rounded-2xl p-1 flex-wrap">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f === 'all' ? `All (${userBookings.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${userBookings.filter(b => b.status === f).length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-purple-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-full" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-purple-50">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600 font-semibold text-lg">
            {userBookings.length === 0 ? 'Koi booking nahi hai abhi' : 'Koi booking nahi mili'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {userBookings.length === 0 ? 'Explore Local se apni pehli booking karo!' : 'Search ya filter change karo'}
          </p>
          {userBookings.length === 0 && (
            <button onClick={() => router.push('/explore-local')}
              className="mt-5 px-6 py-3 text-white rounded-2xl font-semibold text-sm shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              Explore Local 🌍
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const sc = statusConfig[booking.status];
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-purple-50 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-44 h-36 md:h-auto flex-shrink-0 overflow-hidden">
                    {booking.listingImage ? (
                      <img src={booking.listingImage} alt={booking.listingTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl">
                        {catEmoji[booking.listingCategory] ?? '📋'}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 text-2xl">{catEmoji[booking.listingCategory] ?? '📋'}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{booking.listingTitle}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />{booking.listingLocation}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" />{booking.date}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-400" />{booking.splitCount} traveler{booking.splitCount > 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1.5 font-bold text-gray-800">
                        <IndianRupee className="w-4 h-4 text-purple-500" />{booking.finalPrice.toLocaleString()}
                        {booking.discountPct > 0 && <span className="text-xs text-emerald-600 font-normal">({booking.discountPct}% off)</span>}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{booking.id}</span>
                    </div>

                    {booking.splitCount > 1 && (
                      <div className="mb-3 text-xs text-purple-600 bg-purple-50 rounded-xl px-3 py-1.5 w-fit">
                        ₹{booking.perPerson.toLocaleString()} per person · {booking.travelers.join(', ')}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setTicketBooking(booking)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors">
                        <QrCode className="w-3.5 h-3.5" /> Ticket
                      </button>
                      <button onClick={() => downloadInvoice(booking)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Invoice
                      </button>
                      {booking.status === 'confirmed' && (
                        <>
                          <button onClick={() => router.push(`/feedback?bookingId=${booking.id}&listingId=${booking.listingId}&title=${encodeURIComponent(booking.listingTitle)}`)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors">
                            <Sparkles className="w-3.5 h-3.5" /> Rate
                          </button>
                          <button onClick={() => setCancelTarget(booking)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors ml-auto">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
