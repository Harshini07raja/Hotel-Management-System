import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Booking } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  UserCheck,
  LogOut,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Shield,
  CreditCard,
} from 'lucide-react';

export const ReceptionistDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/v1/bookings')
      .then((res) => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.response?.data?.message || 'Access restricted. Role RECEPTIONIST or ADMIN required.'))
      .finally(() => setLoading(false));
  };

  const handleCheckIn = async (bookingId: string) => {
    setActionLoading(bookingId);
    setMessage(null);
    setError(null);
    try {
      await api.post(`/api/v1/bookings/${bookingId}/check-in`);
      setMessage(`Guest successfully checked into room for booking ${bookingId}.`);
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    setActionLoading(bookingId);
    setMessage(null);
    setError(null);
    try {
      const res = await api.post(`/api/v1/bookings/${bookingId}/check-out`);
      setMessage(`Check-out completed for booking ${bookingId}. Room scheduled for housekeeping cleaning.`);
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      (b.id ?? '').toLowerCase().includes(q) ||
      (b.guestName ?? '').toLowerCase().includes(q) ||
      (b.roomNumber ?? '').toLowerCase().includes(q) ||
      (b.hotelName ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-600" /> Front Desk Receptionist Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize guest check-in, process departures, and trigger automated room hygiene handoffs
          </p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl p-4 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter reservations by Booking ID (BK-...), Guest Name, Room #, or Hotel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm font-medium focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">Current Reservations</span>
          <span className="text-xs text-slate-400 font-mono">{filtered.length} entries shown</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading reservations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No reservations match search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Front Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.guestName}</div>
                      <div className="text-[11px] text-slate-400">{b.guestEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{b.hotelName}</div>
                      <div className="text-[11px] text-slate-500">Room #{b.roomNumber} ({b.roomType})</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {b.checkInDate} to {b.checkOutDate} ({b.totalNights}n)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${b.totalPrice}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCheckIn(b.id)}
                          disabled={actionLoading === b.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-sm disabled:opacity-50"
                        >
                          {actionLoading === b.id ? 'Checking In...' : 'Check In'}
                        </button>
                      )}

                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(b.id)}
                          disabled={actionLoading === b.id}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1 inline-flex"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {actionLoading === b.id ? 'Checking Out...' : 'Check Out'}
                        </button>
                      )}

                      {b.status !== 'CONFIRMED' && b.status !== 'CHECKED_IN' && (
                        <span className="text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
