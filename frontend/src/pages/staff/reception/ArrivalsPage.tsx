import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { Booking } from '../../../types';
import { BookingStatusBadge } from '../../../components/ui/BookingStatusBadge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog';
import { LogIn, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

export const ArrivalsPage: React.FC = () => {
  const [arrivals, setArrivals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; bookingId: string; loading: boolean }>({ open: false, bookingId: '', loading: false });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchArrivals = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/bookings')
      .then(res => {
        const all: Booking[] = Array.isArray(res.data) ? res.data : [];
        setArrivals(all.filter(b => b.status === 'CONFIRMED' && b.checkInDate === today));
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load arrivals.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchArrivals(); }, [fetchArrivals]);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleCheckIn = async () => {
    setDialog(d => ({ ...d, loading: true }));
    try {
      await api.post(`/api/v1/bookings/${dialog.bookingId}/check-in`);
      showFeedback('success', 'Guest checked in successfully. Room is now occupied.');
      fetchArrivals();
    } catch (e: any) {
      showFeedback('error', e?.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setDialog({ open: false, bookingId: '', loading: false });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <LogIn className="w-6 h-6 text-emerald-600" />
            Today's Arrivals
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{today} · {arrivals.length} guest{arrivals.length !== 1 ? 's' : ''} expected</p>
        </div>
        <button onClick={fetchArrivals} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {feedback && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton variant="list-item" count={5} />
      ) : arrivals.length === 0 ? (
        <EmptyState
          title="No arrivals today"
          description="All confirmed guests for today have already been checked in."
          icon={LogIn}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Guest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Booking Ref</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-In</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-Out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {arrivals.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{b.guestName}</p>
                      <p className="text-xs text-slate-400">{b.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{String(b.id).slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-slate-600">{b.checkInDate}</td>
                    <td className="px-4 py-3 text-slate-600">{b.checkOutDate}</td>
                    <td className="px-4 py-3 text-slate-600">{b.roomNumber || '—'}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDialog({ open: true, bookingId: b.id, loading: false })}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                      >
                        <LogIn className="w-3 h-3" />
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={dialog.open}
        title="Confirm Check-In"
        message="Mark this guest as checked in? The room will be marked occupied and the guest will be notified."
        confirmLabel="Confirm Check-In"
        cancelLabel="Cancel"
        variant="info"
        loading={dialog.loading}
        onConfirm={handleCheckIn}
        onCancel={() => setDialog({ open: false, bookingId: '', loading: false })}
      />
    </div>
  );
};

export default ArrivalsPage;
