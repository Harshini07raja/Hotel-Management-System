import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { Booking } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { BookingStatusBadge } from '../../components/ui/BookingStatusBadge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Calendar, Users, CheckCircle2, LogOut, Search, RefreshCw, LogIn, Clock
} from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const ReceptionPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'all'>('arrivals');
  const [search, setSearch] = useState('');
  const [time, setTime] = useState(formatTime(new Date()));
  const [dialog, setDialog] = useState<{ open: boolean; bookingId: string; action: 'check-in' | 'check-out'; loading: boolean }>({
    open: false, bookingId: '', action: 'check-in', loading: false,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    api.get('/api/v1/bookings')
      .then(res => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const arrivals = bookings.filter(b => b.status === 'CONFIRMED' && b.checkInDate === today);
  const departures = bookings.filter(b => b.status === 'CHECKED_IN' && b.checkOutDate === today);
  const occupied = bookings.filter(b => b.status === 'CHECKED_IN').length;
  const active = bookings.filter(b => !['CANCELLED'].includes(b.status)).length;

  const displayed = (() => {
    const base = activeTab === 'arrivals' ? arrivals : activeTab === 'departures' ? departures : bookings;
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(b =>
      b.guestName?.toLowerCase().includes(q) ||
      b.shortBookingCode?.toLowerCase().includes(q) ||
      b.id?.toLowerCase().includes(q)
    );
  })();

  const openDialog = (bookingId: string, action: 'check-in' | 'check-out') => {
    setDialog({ open: true, bookingId, action, loading: false });
  };

  const handleConfirm = async () => {
    setDialog(d => ({ ...d, loading: true }));
    try {
      await api.post(`/api/v1/bookings/${dialog.bookingId}/${dialog.action}`);
      setFeedback(`${dialog.action === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
      fetchBookings();
    } catch {
      setFeedback('Action failed. Please try again.');
    } finally {
      setDialog(d => ({ ...d, open: false, loading: false }));
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const TABS = [
    { key: 'arrivals' as const, label: `Arrivals (${arrivals.length})` },
    { key: 'departures' as const, label: `Departures (${departures.length})` },
    { key: 'all' as const, label: `All Bookings (${bookings.length})` },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-aurevia-forest text-white py-6">
        <div className="page-section">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-1">Staff Portal</p>
              <h1 className="font-display text-3xl text-white">Front Desk</h1>
              <p className="text-white/60 text-sm mt-1">Aurevia Hotels — Receptionist Dashboard</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl text-aurevia-gold">{time}</div>
              <div className="text-white/60 text-xs mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-section py-8 space-y-6">
        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl p-3 text-sm font-medium ${feedback.includes('successful') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {feedback}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Today's Arrivals" value={arrivals.length} icon={<LogIn className="w-5 h-5" />} />
          <MetricCard label="Today's Departures" value={departures.length} icon={<LogOut className="w-5 h-5" />} />
          <MetricCard label="Currently Occupied" value={occupied} icon={<Users className="w-5 h-5" />} />
          <MetricCard label="Active Bookings" value={active} icon={<Calendar className="w-5 h-5" />} />
        </div>

        {/* Tab bar + search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-aurevia-ivory rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? 'bg-aurevia-forest text-white shadow-sm' : 'text-aurevia-muted hover:text-aurevia-charcoal'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-aurevia-muted" />
              <input
                className="input-field pl-9 py-2 text-sm"
                placeholder="Search guest or booking ref…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchBookings} className="btn-ghost px-3 py-2">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton count={5} variant="list-item" />
        ) : displayed.length === 0 ? (
          <EmptyState
            title="No bookings"
            description={activeTab === 'arrivals' ? 'No arrivals scheduled for today.' : activeTab === 'departures' ? 'No departures scheduled for today.' : 'No bookings found.'}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-aurevia-ivory border-b border-aurevia-border">
                  <tr>
                    {['Booking Ref', 'Guest', 'Hotel', 'Room', 'Check-in', 'Check-out', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-aurevia-charcoal whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurevia-border">
                  {displayed.map(b => (
                    <tr key={b.id} className="hover:bg-aurevia-ivory/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-aurevia-forest font-semibold">
                        {b.shortBookingCode || b.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-medium text-aurevia-charcoal">{b.guestName}</td>
                      <td className="px-4 py-3 text-aurevia-muted text-xs">{b.hotelName}</td>
                      <td className="px-4 py-3 text-aurevia-muted text-xs">{b.roomNumber}</td>
                      <td className="px-4 py-3 text-aurevia-muted text-xs whitespace-nowrap">{b.checkInDate}</td>
                      <td className="px-4 py-3 text-aurevia-muted text-xs whitespace-nowrap">{b.checkOutDate}</td>
                      <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => openDialog(b.id, 'check-in')}
                              className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Check In
                            </button>
                          )}
                          {b.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => openDialog(b.id, 'check-out')}
                              className="flex items-center gap-1 text-xs bg-aurevia-gold text-aurevia-forest hover:bg-aurevia-gold-dark px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              <Clock className="w-3.5 h-3.5" /> Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-aurevia-border text-xs text-aurevia-muted">
              Showing {displayed.length} booking{displayed.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={dialog.open}
        title={dialog.action === 'check-in' ? 'Confirm Check-In' : 'Confirm Check-Out'}
        message={dialog.action === 'check-in'
          ? 'Are you sure you want to check in this guest? This will mark the booking as Checked In.'
          : 'Are you sure you want to check out this guest? This will finalize their stay.'}
        confirmLabel={dialog.action === 'check-in' ? 'Check In' : 'Check Out'}
        variant="info"
        loading={dialog.loading}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(d => ({ ...d, open: false }))}
      />
    </div>
  );
};
