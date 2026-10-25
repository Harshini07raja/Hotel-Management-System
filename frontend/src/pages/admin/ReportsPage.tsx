import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { BarChart2, RefreshCw, AlertCircle, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';

interface Booking { id: string; status: string; totalPrice?: number; checkInDate: string; checkOutDate: string; guestName: string; }
interface BookingStats {
  total: number; confirmed: number; checkedIn: number; checkedOut: number; cancelled: number;
  totalRevenue: number; avgBookingValue: number;
}

function calcStats(bookings: Booking[]): BookingStats {
  const confirmed  = bookings.filter(b => b.status === 'CONFIRMED').length;
  const checkedIn  = bookings.filter(b => b.status === 'CHECKED_IN').length;
  const checkedOut = bookings.filter(b => b.status === 'CHECKED_OUT').length;
  const cancelled  = bookings.filter(b => b.status === 'CANCELLED').length;
  const paid = bookings.filter(b => b.totalPrice != null);
  const totalRevenue = paid.reduce((sum, b) => sum + Number(b.totalPrice), 0);
  const avgBookingValue = paid.length > 0 ? totalRevenue / paid.length : 0;
  return { total: bookings.length, confirmed, checkedIn, checkedOut, cancelled, totalRevenue, avgBookingValue };
}

export const ReportsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(() => {
    setLoading(true); setError(null);
    api.get('/api/v1/bookings')
      .then(res => {
        setBookings(Array.isArray(res.data) ? res.data : []);
        setLastUpdated(new Date());
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load report data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = calcStats(bookings);

  // Group by month (last 6 months)
  const byMonth: Record<string, { bookings: number; revenue: number }> = {};
  bookings.forEach(b => {
    const m = b.checkInDate?.slice(0, 7);
    if (!m) return;
    if (!byMonth[m]) byMonth[m] = { bookings: 0, revenue: 0 };
    byMonth[m].bookings++;
    if (b.totalPrice != null) byMonth[m].revenue += Number(b.totalPrice);
  });
  const months = Object.keys(byMonth).sort().slice(-6);

  const maxBookings = Math.max(...months.map(m => byMonth[m].bookings), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-600" />
            Business Reports
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Based on {bookings.length} booking records · Updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* KPI summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
              { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Avg Booking Value', value: `$${stats.avgBookingValue.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
              { label: 'Cancellation Rate', value: stats.total > 0 ? `${((stats.cancelled / stats.total) * 100).toFixed(1)}%` : '—', icon: Users, color: 'text-rose-600 bg-rose-50' },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="card card-padding">
                  <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Status breakdown */}
          <div className="card card-padding">
            <h3 className="font-semibold text-slate-700 mb-4">Reservation Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Confirmed', count: stats.confirmed, color: 'bg-blue-100 text-blue-700' },
                { label: 'Checked In', count: stats.checkedIn, color: 'bg-emerald-100 text-emerald-700' },
                { label: 'Checked Out', count: stats.checkedOut, color: 'bg-slate-100 text-slate-700' },
                { label: 'Cancelled', count: stats.cancelled, color: 'bg-rose-100 text-rose-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly trend */}
          {months.length > 0 ? (
            <div className="card card-padding">
              <h3 className="font-semibold text-slate-700 mb-4">Monthly Booking Trend (Last 6 Months)</h3>
              <div className="flex items-end gap-3 h-32">
                {months.map(m => {
                  const d = byMonth[m];
                  const barH = Math.round((d.bookings / maxBookings) * 100);
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex items-end justify-center h-24">
                        <div
                          className="w-full bg-aurevia-forest/80 rounded-t-lg hover:bg-aurevia-forest transition-all"
                          style={{ height: `${barH}%`, minHeight: '4px' }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {d.bookings} bookings · ${d.revenue.toFixed(0)}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{m.slice(5)}/{m.slice(0, 4).slice(-2)}</p>
                      <p className="text-xs font-bold text-slate-600">{d.bookings}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState title="No monthly data" description="Book data will appear once reservations have check-in dates." icon={BarChart2} />
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
            <strong className="text-slate-700">Note:</strong> Revenue figures are based on booking totalPrice values recorded at time of booking. Advanced reporting with date-range filters requires backend aggregate APIs not yet implemented. Revenue shown is the sum of all recorded booking amounts.
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
