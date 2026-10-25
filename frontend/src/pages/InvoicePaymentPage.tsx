import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { Invoice } from '../types';
import { BookingStatusBadge } from '../components/ui/BookingStatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { BRAND } from '../brand';
import {
  CheckCircle2, CreditCard, Smartphone, Wallet, Printer,
  Building2, Calendar, User, Hash, ArrowLeft
} from 'lucide-react';

type PaymentMethod = 'CARD' | 'UPI' | 'WALLET';

const METHOD_OPTIONS: { value: PaymentMethod; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { value: 'UPI', label: 'UPI Payment', icon: Smartphone, desc: 'GPay, PhonePe, BHIM' },
  { value: 'WALLET', label: 'Digital Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay' },
];

export const InvoicePaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/api/v1/bookings/${bookingId}`),
      api.get(`/api/v1/bookings/${bookingId}/invoice`),
    ])
      .then(([bRes, invRes]) => {
        setBooking(bRes.data);
        setInvoice(invRes.data);
      })
      .catch(() => setError('Could not load the invoice. Please try again.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  const handlePay = async () => {
    if (!invoice || !bookingId) return;
    setPaying(true);
    setPayError(null);
    try {
      await api.post(`/api/v1/bookings/${bookingId}/payment`, {
        paymentMethod: method,
        simulateFailure,
      });
      load(); // Reload to reflect PAID status
    } catch (err: any) {
      setPayError(err?.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container page-section py-12">
        <LoadingSkeleton count={4} variant="text-block" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="page-container page-section py-12">
        <ErrorState title="Invoice Not Found" message={error || 'Invoice could not be loaded.'} onRetry={load} />
      </div>
    );
  }

  const isPaid = invoice.paymentStatus === 'PAID';
  const nights = booking ? Math.max(1, Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000
  )) : 1;

  return (
    <div className="page-container py-8 bg-aurevia-ivory">
      <div className="page-section max-w-3xl mx-auto">
        {/* Back nav */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-aurevia-muted hover:text-aurevia-forest text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Invoice Card */}
        <div className="card overflow-hidden" id="invoice-print">
          {/* Invoice header */}
          <div className="bg-aurevia-forest p-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-aurevia-gold rounded-lg flex items-center justify-center font-display text-xl font-bold text-aurevia-forest">A</div>
                <div>
                  <p className="font-display text-white text-lg leading-none">Aurevia</p>
                  <p className="text-aurevia-gold/70 text-xs">Hotels & Resorts</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-xs uppercase tracking-widest font-semibold">Invoice</p>
              <p className="font-mono text-aurevia-gold text-sm mt-1">{invoice.id?.slice(0, 12).toUpperCase()}</p>
              <p className="text-white/50 text-xs mt-0.5">{new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Booking & guest details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-xs text-aurevia-muted font-semibold uppercase tracking-wide">Guest Details</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-aurevia-muted shrink-0" />
                  <span className="font-medium text-aurevia-charcoal">{invoice.guestName}</span>
                </div>
                {booking?.guestEmail && (
                  <p className="text-aurevia-muted text-xs ml-6">{booking.guestEmail}</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-aurevia-muted font-semibold uppercase tracking-wide">Stay Details</p>
                {booking && (
                  <>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-aurevia-muted shrink-0" />
                      <span className="font-medium text-aurevia-charcoal">{booking.hotelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-aurevia-muted shrink-0" />
                      <span className="text-aurevia-charcoal text-xs">{booking.checkInDate} → {booking.checkOutDate} ({nights} night{nights !== 1 ? 's' : ''})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-aurevia-muted shrink-0" />
                      <span className="font-mono text-xs text-aurevia-forest font-semibold">{booking.shortBookingCode || booking.id?.slice(0, 8)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Itemized table */}
            <div className="border border-aurevia-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-aurevia-ivory">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-aurevia-charcoal">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-aurevia-charcoal">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurevia-border">
                  <tr>
                    <td className="px-4 py-3 text-aurevia-charcoal">
                      Room charges
                      <span className="text-xs text-aurevia-muted ml-2">({nights} night{nights !== 1 ? 's' : ''} × ${booking?.nightlyRateSnapshot ?? '—'})</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${invoice.roomCharges.toFixed(2)}</td>
                  </tr>
                  {invoice.serviceCharges > 0 && (
                    <tr>
                      <td className="px-4 py-3 text-aurevia-charcoal">Service charges</td>
                      <td className="px-4 py-3 text-right font-medium">${invoice.serviceCharges.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 text-aurevia-charcoal">Tax (12%)</td>
                    <td className="px-4 py-3 text-right font-medium">${invoice.taxAmount.toFixed(2)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td className="px-4 py-3 text-emerald-700">Discount</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">−${invoice.discount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-aurevia-forest text-white">
                    <td className="px-4 py-3 font-bold font-display text-lg">Total</td>
                    <td className="px-4 py-3 text-right font-bold font-mono text-xl">${invoice.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment status */}
            <div className="flex items-center justify-between py-3 border-t border-aurevia-border">
              <span className="text-sm text-aurevia-muted">Payment Status</span>
              <span className={`badge ${isPaid ? 'badge-green' : 'badge-amber'} text-sm`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {invoice.paymentStatus}
              </span>
            </div>

            {/* Paid confirmation */}
            {isPaid && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Payment Confirmed</p>
                  {invoice.paymentReference && (
                    <p className="text-xs text-emerald-700 mt-0.5">Reference: <span className="font-mono">{invoice.paymentReference}</span></p>
                  )}
                  {invoice.paidAt && (
                    <p className="text-xs text-emerald-700">{new Date(invoice.paidAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3 flex-wrap">
            {isPaid ? (
              <>
                <button onClick={() => window.print()} className="btn-ghost flex items-center gap-2 text-sm">
                  <Printer className="w-4 h-4" /> Download Invoice
                </button>
                <Link to="/my-account/bookings" className="btn-primary text-sm">My Bookings</Link>
              </>
            ) : null}
          </div>
        </div>

        {/* Payment Form (if unpaid) */}
        {!isPaid && (
          <div className="card card-padding mt-6">
            <h2 className="font-display text-xl text-aurevia-charcoal mb-4">Complete Payment</h2>

            {/* Method selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {METHOD_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const selected = method === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMethod(opt.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition ${
                      selected ? 'border-aurevia-forest bg-aurevia-ivory' : 'border-aurevia-border hover:border-aurevia-forest/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${selected ? 'text-aurevia-forest' : 'text-aurevia-muted'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${selected ? 'text-aurevia-forest' : 'text-aurevia-charcoal'}`}>{opt.label}</p>
                      <p className="text-xs text-aurevia-muted">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulate failure toggle */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
              <div
                onClick={() => setSimulateFailure(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors ${simulateFailure ? 'bg-rose-500' : 'bg-slate-200'} relative cursor-pointer`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${simulateFailure ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-aurevia-charcoal">
                Simulate payment failure <span className="text-aurevia-muted text-xs">(for testing)</span>
              </span>
            </label>

            {payError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm mb-4">
                {payError}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="btn-gold w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-aurevia-forest/30 border-t-aurevia-forest rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                `Pay $${invoice.totalAmount.toFixed(2)}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
