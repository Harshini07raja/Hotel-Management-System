import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Booking } from '../../types';
import { BookingStatusBadge } from '../../components/ui/BookingStatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar, Users, CheckCircle2, XCircle, RefreshCw, Receipt } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/v1/bookings')
      .then(res => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const checkedIn = bookings.filter(b => b.status === 'CHECKED_IN').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
  const revenue = bookings.filter(b => ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status)).reduce((s, b) => s + (b.totalPrice || 0), 0);

  return (
    <div className="page-container py-8">
      <div className="page-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-aurevia-gold font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-display text-display-md text-aurevia-charcoal">Bookings</h1>
          </div>
          <button onClick={fetchBookings} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Bookings" value={bookings.length} icon={<Calendar className="w-5 h-5" />} />
          <MetricCard label="Confirmed" value={confirmed} icon={<CheckCircle2 className="w-5 h-5" />} />
          <MetricCard label="Checked In" value={checkedIn} icon={<Users className="w-5 h-5" />} />
          <MetricCard label="Est. Revenue" value={`$${revenue.toLocaleString()}`} icon={<Receipt className="w-5 h-5" />} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${filter === s ? 'bg-aurevia-forest text-white' : 'bg-white border border-aurevia-border text-aurevia-muted hover:text-aurevia-charcoal'}`}
            >
              {s === 'ALL' ? `All (${bookings.length})` : s}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSkeleton count={5} variant="list-item" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No bookings" description="No bookings match the selected filter." />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-aurevia-ivory border-b border-aurevia-border">
                  <tr>
                    {['Ref', 'Guest', 'Hotel', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-aurevia-charcoal text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurevia-border">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-aurevia-ivory/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-aurevia-forest font-semibold">{b.shortBookingCode || b.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-medium">{b.guestName}</td>
                      <td className="px-4 py-3 text-aurevia-muted">{b.hotelName}</td>
                      <td className="px-4 py-3 text-aurevia-muted">{b.roomNumber}</td>
                      <td className="px-4 py-3 text-aurevia-muted">{b.checkInDate}</td>
                      <td className="px-4 py-3 text-aurevia-muted">{b.checkOutDate}</td>
                      <td className="px-4 py-3 font-semibold">${b.totalPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <Link to={`/my-account/bookings/${b.id}`} className="btn-link text-xs">Details →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
