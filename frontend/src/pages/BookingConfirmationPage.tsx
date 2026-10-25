import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Booking } from '../types';
import { BookingStatusBadge } from '../components/ui/BookingStatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CheckCircle2, Copy, ExternalLink, Calendar, Users, Building2, ArrowRight, ChevronRight } from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<'code' | 'url' | null>(null);

  const fetchBooking = useCallback(() => {
    if (!bookingId) return;
    api.get(`/api/v1/bookings/${bookingId}`)
      .then(res => {
        setBooking(res.data);
        // Create short URL for this booking confirmation page
        const originalUrl = `${window.location.origin}/booking-confirmation/${bookingId}`;
        return api.post('/api/v1/short-urls', { originalUrl });
      })
      .then(res => {
        if (res?.data?.shortUrl) setShortUrl(res.data.shortUrl);
      })
      .catch(() => {}) // Non-critical
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const copyToClipboard = (text: string, type: 'code' | 'url') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  if (loading) {
    return (
      <div className="page-container page-section py-12">
        <LoadingSkeleton count={4} variant="text-block" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-container page-section py-20 text-center">
        <p className="text-aurevia-muted">Booking not found.</p>
        <Link to="/hotels" className="btn-primary mt-4">Search Hotels</Link>
      </div>
    );
  }

  const nights = Math.max(1, Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000
  ));
  const refCode = booking.shortBookingCode || booking.id.slice(0, 12).toUpperCase();

  return (
    <div className="page-container">
      {/* Success hero */}
      <div className="bg-aurevia-forest py-16 text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-aurevia-gold/20 border-2 border-aurevia-gold mb-5">
          <CheckCircle2 className="w-10 h-10 text-aurevia-gold" />
        </div>
        <h1 className="font-display text-display-lg text-white mb-2">Booking Confirmed!</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto">
          Your reservation has been successfully created. We look forward to welcoming you.
        </p>
      </div>

      {/* Main card */}
      <div className="page-section py-8">
        <div className="max-w-2xl mx-auto -mt-12 relative z-10">
          <div className="card overflow-hidden shadow-2xl">
            {/* Booking reference */}
            <div className="bg-aurevia-ivory p-6 border-b border-aurevia-border text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-aurevia-muted mb-2">Booking Reference</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-bold text-aurevia-forest tracking-wider">{refCode}</span>
                <button
                  onClick={() => copyToClipboard(refCode, 'code')}
                  className="p-2 rounded-lg hover:bg-aurevia-ivory-dark transition"
                  title="Copy reference"
                >
                  <Copy className={`w-4 h-4 ${copied === 'code' ? 'text-emerald-500' : 'text-aurevia-muted'}`} />
                </button>
              </div>
              {shortUrl && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <ExternalLink className="w-3.5 h-3.5 text-aurevia-muted" />
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-aurevia-forest hover:underline font-mono">{shortUrl}</a>
                  <button
                    onClick={() => copyToClipboard(shortUrl, 'url')}
                    className="p-1 rounded hover:bg-aurevia-ivory-dark transition"
                  >
                    <Copy className={`w-3.5 h-3.5 ${copied === 'url' ? 'text-emerald-500' : 'text-aurevia-muted'}`} />
                  </button>
                </div>
              )}
              <div className="mt-3">
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>

            {/* Booking details */}
            <div className="p-6">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-aurevia-border">
                  {[
                    { icon: Building2, label: 'Hotel', value: booking.hotelName },
                    { icon: Calendar, label: 'Room', value: `Room ${booking.roomNumber} — ${booking.roomType}` },
                    { icon: Calendar, label: 'Check-in', value: new Date(booking.checkInDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: Calendar, label: 'Check-out', value: new Date(booking.checkOutDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: Calendar, label: 'Duration', value: `${nights} night${nights !== 1 ? 's' : ''}` },
                    { icon: Users, label: 'Guests', value: `${booking.guestCount} guest${booking.guestCount !== 1 ? 's' : ''}` },
                    { icon: null, label: 'Total Amount', value: `$${booking.totalPrice.toFixed(2)}` },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-4 text-aurevia-muted font-medium whitespace-nowrap">{row.label}</td>
                      <td className={`py-3 font-${row.label === 'Total Amount' ? 'bold text-aurevia-forest text-base' : 'medium text-aurevia-charcoal'}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/my-account/bookings/${bookingId}`}
                className="btn-gold flex-1 text-center flex items-center justify-center gap-2"
              >
                View Invoice
              </Link>
              <Link
                to="/my-account/bookings"
                className="btn-ghost flex-1 text-center flex items-center justify-center gap-2"
              >
                My Bookings
              </Link>
              <Link
                to="/hotels"
                className="btn-link text-sm flex items-center justify-center gap-1"
              >
                Book Another <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-8">
            <h2 className="font-display text-xl text-aurevia-charcoal mb-4 text-center">What Happens Next?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Confirmation Email', desc: 'You will receive a booking confirmation email with all the details.', icon: '📧' },
                { step: '2', title: 'Before Arrival', desc: 'Complete your invoice payment at least 24 hours before check-in.', icon: '💳' },
                { step: '3', title: 'Check-in Ready', desc: 'Present your booking reference at the front desk. Enjoy your stay!', icon: '🏨' },
              ].map(step => (
                <div key={step.step} className="card card-padding text-center">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <p className="font-semibold text-aurevia-charcoal text-sm">{step.title}</p>
                  <p className="text-xs text-aurevia-muted mt-1 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
