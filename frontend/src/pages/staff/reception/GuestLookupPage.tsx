import React, { useState, useCallback } from 'react';
import api from '../../../api/client';
import { Booking } from '../../../types';
import { BookingStatusBadge } from '../../../components/ui/BookingStatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Search, Users, Calendar, AlertCircle, Loader } from 'lucide-react';

interface GuestGroup {
  name: string;
  email: string;
  bookings: Booking[];
}

export const GuestLookupPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [allBookings, setAllBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await api.get('/api/v1/bookings');
      setAllBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load guest data.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const q = query.toLowerCase().trim();
  const matched: Booking[] = (allBookings ?? []).filter(b =>
    b.guestName?.toLowerCase().includes(q) ||
    b.guestEmail?.toLowerCase().includes(q)
  );

  // Group by email
  const groups = matched.reduce<Record<string, GuestGroup>>((acc, b) => {
    const key = b.guestEmail || b.guestName;
    if (!acc[key]) acc[key] = { name: b.guestName, email: b.guestEmail, bookings: [] };
    acc[key].bookings.push(b);
    return acc;
  }, {});

  const guestGroups = Object.values(groups);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-aurevia-forest" />
          Guest Lookup
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Search by guest name or email address</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Enter guest name or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary gap-2" disabled={loading || !query.trim()}>
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span className="text-sm">Searching…</span>
        </div>
      )}

      {!loading && searched && guestGroups.length === 0 && (
        <EmptyState
          title="No guests found"
          description={`No results for "${query}". Try a different name or email.`}
          icon={Users}
        />
      )}

      {!loading && guestGroups.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-medium">{guestGroups.length} guest{guestGroups.length !== 1 ? 's' : ''} found</p>
          {guestGroups.map(group => {
            const lastBooking = group.bookings.sort((a, b) =>
              new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
            )[0];
            return (
              <div key={group.email} className="card card-padding">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-aurevia-forest text-aurevia-gold flex items-center justify-center font-display text-xl font-bold shrink-0">
                    {group.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-lg">{group.name}</p>
                    <p className="text-sm text-slate-400">{group.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {group.bookings.length} booking{group.bookings.length !== 1 ? 's' : ''}
                      </span>
                      {lastBooking && (
                        <span className="text-xs text-slate-400">
                          Last stay: {lastBooking.checkInDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Booking History</p>
                  <div className="space-y-2">
                    {group.bookings
                      .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
                      .slice(0, 5)
                      .map(b => (
                        <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <span className="font-mono text-xs text-slate-500">#{String(b.id).slice(-8).toUpperCase()}</span>
                              <span className="text-xs text-slate-400 ml-2">{b.checkInDate} → {b.checkOutDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {b.totalPrice != null && (
                              <span className="text-xs font-medium text-slate-600">${Number(b.totalPrice).toFixed(2)}</span>
                            )}
                            <BookingStatusBadge status={b.status} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuestLookupPage;
