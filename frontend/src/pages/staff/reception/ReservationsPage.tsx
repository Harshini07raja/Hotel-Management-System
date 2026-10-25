import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { Booking } from '../../../types';
import { BookingStatusBadge } from '../../../components/ui/BookingStatusBadge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Calendar, Search, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

export const ReservationsPage: React.FC = () => {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/bookings')
      .then(res => setAllBookings(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load reservations.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = allBookings
    .filter(b => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        b.guestName?.toLowerCase().includes(q) ||
        b.guestEmail?.toLowerCase().includes(q) ||
        String(b.id).toLowerCase().includes(q) ||
        b.roomNumber?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-aurevia-forest" />
            All Reservations
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{filtered.length} reservation{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={fetchBookings} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search by guest name, email, or booking ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton variant="list-item" count={8} />
      ) : paged.length === 0 ? (
        <EmptyState title="No reservations found" description="Try adjusting your filters." icon={Calendar} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Booking Ref</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Guest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-In</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-Out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{String(b.id).slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{b.guestName}</p>
                      <p className="text-xs text-slate-400">{b.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.roomNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{b.checkInDate}</td>
                    <td className="px-4 py-3 text-slate-600">{b.checkOutDate}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {b.totalPrice != null ? `$${Number(b.totalPrice).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-xs text-slate-400">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost px-2.5 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 font-medium">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost px-2.5 py-1.5 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
