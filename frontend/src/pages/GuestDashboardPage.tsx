import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookingStatusBadge } from '../components/ui/BookingStatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import {
  LayoutDashboard,
  Calendar,
  Receipt,
  Bell,
  User,
  CreditCard,
  Ban,
  Sparkles,
  AlertCircle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const GuestDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/v1/guests/me/bookings')
      .then((res) => {
        setBookings(res.data || []);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Failed to load reservations.');
      })
      .finally(() => setLoading(false));
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    setCancelInProgress(true);
    setError(null);
    try {
      await api.post(`/api/v1/bookings/${cancellingBookingId}/cancel`);
      setCancellingBookingId(null);
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancelInProgress(false);
    }
  };

  // Derived bookings
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
  );
  const nextBooking = upcomingBookings[0] || null;

  const filteredBookings = statusFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="page-container py-10">
      <div className="page-section space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-aurevia-border pb-6">
          <div>
            <h1 className="font-display text-display-md text-aurevia-forest">My Account</h1>
            <p className="text-sm text-aurevia-muted mt-1">
              Manage your luxury stays, reservations, and guest profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/search" className="btn-gold">
              <Sparkles className="w-4 h-4" /> Book a New Stay
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-semibold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Layout with Sticky Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar (w-64) */}
          <aside className="w-full lg:w-64 bg-white rounded-2xl border border-aurevia-border p-4 sticky top-24 shadow-aurevia-sm shrink-0">
            <div className="px-3 py-2 mb-3 border-b border-aurevia-border/60">
              <p className="text-xs uppercase font-semibold text-aurevia-muted tracking-wider">Account Navigation</p>
            </div>
            <nav className="space-y-1.5" aria-label="Account Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeTab === 'overview'
                    ? 'bg-aurevia-forest text-white shadow-sm'
                    : 'text-aurevia-charcoal hover:bg-aurevia-ivory'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeTab === 'bookings'
                    ? 'bg-aurevia-forest text-white shadow-sm'
                    : 'text-aurevia-charcoal hover:bg-aurevia-ivory'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="flex-1 text-left">My Bookings</span>
                {bookings.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-aurevia-ivory-dark text-aurevia-forest'
                  }`}>
                    {bookings.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-aurevia-charcoal hover:bg-aurevia-ivory transition"
              >
                <Receipt className="w-4 h-4 text-aurevia-muted" />
                <span className="flex-1 text-left">Invoices</span>
              </button>

              <Link
                to="/notifications"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-aurevia-charcoal hover:bg-aurevia-ivory transition"
              >
                <Bell className="w-4 h-4 text-aurevia-muted" />
                <span>Notifications</span>
              </Link>

              <Link
                to="/profile"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-aurevia-charcoal hover:bg-aurevia-ivory transition"
              >
                <User className="w-4 h-4 text-aurevia-muted" />
                <span>Profile</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Welcome Banner */}
                <div className="bg-aurevia-forest rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-aurevia">
                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-widest text-aurevia-gold font-semibold">
                          Guest Portal
                        </span>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">
                          Welcome back, {user?.name || 'Valued Guest'}!
                        </h2>
                        <p className="text-xs sm:text-sm text-aurevia-ivory/80 mt-1 max-w-xl">
                          {nextBooking
                            ? `You have an upcoming stay at ${nextBooking.hotelName} arriving on ${nextBooking.checkInDate}.`
                            : 'Explore our portfolio of curated sanctuaries and plan your next memorable retreat.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link to="/search" className="btn-gold text-xs px-4 py-2.5">
                          <Sparkles className="w-3.5 h-3.5" /> Book a New Stay
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveTab('bookings')}
                          className="btn-ghost bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs px-4 py-2.5"
                        >
                          View All Bookings
                        </button>
                      </div>
                    </div>

                    {nextBooking && (
                      <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 bg-white/5 rounded-xl p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-aurevia-gold font-semibold uppercase tracking-wider">Next Stay</p>
                          <p className="font-display text-lg font-bold text-white">{nextBooking.hotelName}</p>
                          <p className="text-xs text-white/70">
                            {nextBooking.checkInDate} → {nextBooking.checkOutDate} • Room #{nextBooking.roomNumber} ({nextBooking.roomType})
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookingStatusBadge status={nextBooking.status} />
                          <Link
                            to={`/booking-confirmation/${nextBooking.id}`}
                            className="text-xs font-semibold text-aurevia-gold hover:underline flex items-center gap-1"
                          >
                            View Details <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decorative background glow */}
                  <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-aurevia-gold/10 blur-2xl pointer-events-none" />
                </div>

                {/* Upcoming Bookings Section */}
                <div className="card card-padding space-y-5">
                  <div className="flex items-center justify-between border-b border-aurevia-border pb-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-aurevia-forest">Upcoming Stays</h3>
                      <p className="text-xs text-aurevia-muted mt-0.5">Active and confirmed reservations awaiting check-in</p>
                    </div>
                    {upcomingBookings.length > 0 && (
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs font-semibold text-aurevia-forest hover:text-aurevia-forest-light flex items-center gap-1"
                      >
                        See all ({bookings.length}) <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <LoadingSkeleton count={2} variant="list-item" />
                  ) : upcomingBookings.length === 0 ? (
                    <EmptyState
                      title="No upcoming reservations"
                      description="You do not have any active or confirmed bookings currently scheduled."
                      action={
                        <Link to="/search" className="btn-gold text-xs">
                          <Sparkles className="w-3.5 h-3.5" /> Reserve a Room
                        </Link>
                      }
                    />
                  ) : (
                    <div className="divide-y divide-aurevia-border">
                      {upcomingBookings.map((b) => (
                        <div
                          key={b.id}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-aurevia-ivory/50 rounded-xl p-3 transition"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-aurevia-forest bg-aurevia-ivory px-2 py-0.5 rounded border border-aurevia-border">
                                Ref: {b.id.slice(0, 8)}...
                              </span>
                              <BookingStatusBadge status={b.status} />
                            </div>
                            <h4 className="font-display text-lg font-bold text-aurevia-charcoal">{b.hotelName}</h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-aurevia-muted">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-aurevia-forest" />
                                {b.checkInDate} to {b.checkOutDate} ({b.totalNights} nights)
                              </span>
                              <span>•</span>
                              <span>Room #{b.roomNumber} ({b.roomType})</span>
                              <span>•</span>
                              <span className="font-semibold text-aurevia-forest">Total: ${b.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Link
                              to={`/booking-confirmation/${b.id}`}
                              className="btn-ghost text-xs py-2 px-3.5"
                            >
                              View Details
                            </Link>
                            <Link
                              to={`/invoice/${b.id}`}
                              className="btn-primary text-xs py-2 px-3.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Invoice / Pay
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Links Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="card p-6 flex items-start gap-4 hover:shadow-aurevia-md transition">
                    <div className="w-12 h-12 rounded-xl bg-aurevia-gold/20 flex items-center justify-center text-aurevia-forest shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display text-lg font-bold text-aurevia-charcoal">Curated Escapes</h4>
                      <p className="text-xs text-aurevia-muted leading-relaxed">
                        Discover bespoke suites and seasonal getaway packages across our luxury properties.
                      </p>
                      <div className="pt-2">
                        <Link to="/search" className="btn-link text-xs">
                          Browse Hotels & Suites →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6 flex items-start gap-4 hover:shadow-aurevia-md transition">
                    <div className="w-12 h-12 rounded-xl bg-aurevia-forest/10 flex items-center justify-center text-aurevia-forest shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display text-lg font-bold text-aurevia-charcoal">Profile & Preferences</h4>
                      <p className="text-xs text-aurevia-muted leading-relaxed">
                        Keep contact details and personal guest preferences current for seamless arrivals.
                      </p>
                      <div className="pt-2">
                        <Link to="/profile" className="btn-link text-xs">
                          Manage Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Bookings Header & Filter Bar */}
                <div className="card card-padding space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-aurevia-forest">All Reservations</h3>
                      <p className="text-xs text-aurevia-muted mt-0.5">
                        Complete reservation audit history across all Aurevia destinations
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-aurevia-ivory p-1.5 rounded-xl border border-aurevia-border text-xs">
                      {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition ${
                            statusFilter === st
                              ? 'bg-aurevia-forest text-white shadow-sm font-semibold'
                              : 'text-aurevia-charcoal hover:bg-white'
                          }`}
                        >
                          {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bookings List */}
                {loading ? (
                  <LoadingSkeleton count={3} variant="list-item" />
                ) : filteredBookings.length === 0 ? (
                  <div className="card card-padding">
                    <EmptyState
                      title="No reservations found"
                      description={
                        statusFilter === 'ALL'
                          ? "You haven't made any reservations yet. Start exploring our luxury destinations."
                          : `No reservations with status "${statusFilter}".`
                      }
                      action={
                        <Link to="/search" className="btn-gold text-xs">
                          <Sparkles className="w-3.5 h-3.5" /> Book a Stay
                        </Link>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="card card-hover card-padding flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-xs font-bold text-aurevia-forest bg-aurevia-ivory px-2.5 py-1 rounded-lg border border-aurevia-border">
                              Booking Ref: {b.id}
                            </span>
                            <BookingStatusBadge status={b.status} />
                          </div>

                          <h4 className="font-display text-xl font-bold text-aurevia-charcoal">{b.hotelName}</h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-aurevia-muted">
                            <span className="flex items-center gap-1.5 font-medium text-aurevia-charcoal">
                              <Calendar className="w-3.5 h-3.5 text-aurevia-forest" />
                              {b.checkInDate} to {b.checkOutDate} ({b.totalNights} nights)
                            </span>
                            <span>•</span>
                            <span>Room #{b.roomNumber} ({b.roomType})</span>
                            <span>•</span>
                            <span className="font-bold text-aurevia-forest text-sm">
                              ${b.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-aurevia-border">
                          <Link
                            to={`/booking-confirmation/${b.id}`}
                            className="btn-ghost text-xs py-2 px-3.5"
                          >
                            Details
                          </Link>

                          <Link
                            to={`/invoice/${b.id}`}
                            className="btn-primary text-xs py-2 px-3.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> View Invoice
                          </Link>

                          {b.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => setCancellingBookingId(b.id)}
                              className="btn-danger text-xs py-2 px-3"
                              title="Cancel Reservation"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={Boolean(cancellingBookingId)}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this booking? This action will release the room inventory back into the cluster."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Reservation"
        variant="danger"
        loading={cancelInProgress}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingBookingId(null)}
      />
    </div>
  );
};

export default GuestDashboardPage;
