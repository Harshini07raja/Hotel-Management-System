import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Invoice } from '../../types';
import { BookingStatusBadge } from '../../components/ui/BookingStatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Receipt, DollarSign, CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Note: There is no /api/v1/invoices list endpoint, so we load from bookings
// and show invoices accessible via booking IDs
export const AdminBillingPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/v1/bookings')
      .then(res => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const totalRevenue = bookings
    .filter(b => ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status))
    .reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);

  const paidCount = bookings.filter(b => b.status === 'CHECKED_OUT').length;
  const pendingCount = bookings.filter(b => ['CONFIRMED', 'CHECKED_IN'].includes(b.status)).length;
  const cancelledRevLoss = bookings.filter(b => b.status === 'CANCELLED').reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);

  return (
    <div className="page-container py-8">
      <div className="page-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-aurevia-gold font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-display text-display-md text-aurevia-charcoal">Billing & Invoices</h1>
          </div>
          <button onClick={fetchBookings} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} accent />
          <MetricCard label="Completed Stays" value={paidCount} icon={<CheckCircle2 className="w-5 h-5" />} />
          <MetricCard label="Pending Payment" value={pendingCount} icon={<Receipt className="w-5 h-5" />} />
          <MetricCard label="Cancellation Impact" value={`$${cancelledRevLoss.toLocaleString()}`} icon={<XCircle className="w-5 h-5" />} />
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-aurevia-border flex items-center justify-between">
            <h2 className="font-semibold text-aurevia-charcoal">All Invoices</h2>
            <p className="text-xs text-aurevia-muted">Click any booking to view invoice</p>
          </div>
          {loading ? (
            <div className="p-4"><LoadingSkeleton count={5} variant="list-item" /></div>
          ) : bookings.length === 0 ? (
            <EmptyState title="No billing records" description="No bookings found to generate invoices from." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-aurevia-ivory border-b border-aurevia-border">
                  <tr>
                    {['Booking Ref', 'Guest', 'Hotel', 'Check-out', 'Amount', 'Status', 'Invoice'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-aurevia-charcoal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurevia-border">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-aurevia-ivory/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-aurevia-forest font-semibold">{b.shortBookingCode || b.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-medium">{b.guestName}</td>
                      <td className="px-4 py-3 text-aurevia-muted">{b.hotelName}</td>
                      <td className="px-4 py-3 text-aurevia-muted">{b.checkOutDate}</td>
                      <td className="px-4 py-3 font-semibold">${(b.totalPrice || 0).toLocaleString()}</td>
                      <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <Link to={`/my-account/bookings/${b.id}`} className="inline-flex items-center gap-1 text-aurevia-forest hover:text-aurevia-forest-light text-xs font-semibold">
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
