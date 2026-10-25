import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import { MetricCard } from '../../../components/ui/MetricCard';
import { BookingStatusBadge } from '../../../components/ui/BookingStatusBadge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog';
import { Booking } from '../../../types';
import {
  LogIn, LogOut as LogOutIcon, BedDouble, Users,
  ArrowRight, RefreshCw, Calendar, CheckCircle2,
} from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

export const ReceptionDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [checkInDialog, setCheckInDialog] = useState<{ open: boolean; bookingId: string; loading: boolean }>({ open: false, bookingId: '', loading: false });
  const [checkOutDialog, setCheckOutDialog] = useState<{ open: boolean; bookingId: string; loading: boolean }>({ open: false, bookingId: '', loading: false });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/bookings')
      .then(res => {
        setBookings(Array.isArray(res.data) ? res.data : []);
        setLastUpdated(new Date());
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const arrivals = bookings.filter(b => b.status === 'CONFIRMED' && b.checkInDate === today);
  const departures = bookings.filter(b => b.status === 'CHECKED_IN' && b.checkOutDate === today);
  const occupied = bookings.filter(b => b.status === 'CHECKED_IN').length;
  const active = bookings.filter(b => !['CANCELLED'].includes(b.status)).length;

  const handleCheckIn = async () => {
    setCheckInDialog(d => ({ ...d, loading: true }));
    try {
      await api.post(`/api/v1/bookings/${checkInDialog.bookingId}/check-in`);
      setFeedback({ type: 'success', msg: 'Guest checked in successfully.' });
      fetchBookings();
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e?.response?.data?.message || 'Check-in failed.' });
    } finally {
      setCheckInDialog({ open: false, bookingId: '', loading: false });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutDialog(d => ({ ...d, loading: true }));
    try {
      await api.post(`/api/v1/bookings/${checkOutDialog.bookingId}/check-out`);
      setFeedback({ type: 'success', msg: 'Guest checked out successfully.' });
      fetchBookings();
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e?.response?.data?.message || 'Check-out failed.' });
    } finally {
      setCheckOutDialog({ open: false, bookingId: '', loading: false });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800">Front Desk Overview</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={fetchBookings} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : null}
          {feedback.msg}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">{error}</div>
      )}

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Today's Arrivals" value={arrivals.length} icon={LogIn} accent />
          <MetricCard label="Today's Departures" value={departures.length} icon={LogOutIcon} />
          <MetricCard label="Rooms Occupied" value={occupied} icon={BedDouble} />
          <MetricCard label="Active Reservations" value={active} icon={Users} />
        </div>
      )}

      {/* Arrivals & Departures previews */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <LogIn className="w-4 h-4 text-emerald-600" />
              Today's Arrivals ({arrivals.length})
            </h3>
            <Link to="/staff/reception/arrivals" className="text-xs text-aurevia-forest font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton variant="list-item" count={3} />
          ) : arrivals.length === 0 ? (
            <EmptyState title="No arrivals today" description="All confirmed guests are checked in." icon={Calendar} size="sm" />
          ) : (
            <div className="space-y-2">
              {arrivals.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{b.guestName}</p>
                    <p className="text-xs text-slate-400">
                      {b.roomNumber ? `Room ${b.roomNumber}` : 'No room assigned'} · Ref #{String(b.id).slice(-6)}
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckInDialog({ open: true, bookingId: b.id, loading: false })}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    Check In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <LogOutIcon className="w-4 h-4 text-amber-600" />
              Today's Departures ({departures.length})
            </h3>
            <Link to="/staff/reception/departures" className="text-xs text-aurevia-forest font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton variant="list-item" count={3} />
          ) : departures.length === 0 ? (
            <EmptyState title="No departures today" description="All guests are checked out." icon={Calendar} size="sm" />
          ) : (
            <div className="space-y-2">
              {departures.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{b.guestName}</p>
                    <p className="text-xs text-slate-400">
                      {b.roomNumber ? `Room ${b.roomNumber}` : '—'} · Out: {b.checkOutDate}
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckOutDialog({ open: true, bookingId: b.id, loading: false })}
                    className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition font-medium"
                  >
                    Check Out
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-in dialog */}
      <ConfirmationDialog
        isOpen={checkInDialog.open}
        title="Confirm Check-In"
        message="Mark this guest as checked in? This will assign the room and notify housekeeping."
        confirmLabel="Check In"
        cancelLabel="Cancel"
        variant="info"
        loading={checkInDialog.loading}
        onConfirm={handleCheckIn}
        onCancel={() => setCheckInDialog({ open: false, bookingId: '', loading: false })}
      />

      {/* Check-out dialog */}
      <ConfirmationDialog
        isOpen={checkOutDialog.open}
        title="Confirm Check-Out"
        message="Mark this guest as checked out? A housekeeping task will be created for the room."
        confirmLabel="Check Out"
        cancelLabel="Cancel"
        variant="warning"
        loading={checkOutDialog.loading}
        onConfirm={handleCheckOut}
        onCancel={() => setCheckOutDialog({ open: false, bookingId: '', loading: false })}
      />
    </div>
  );
};

export default ReceptionDashboardPage;
