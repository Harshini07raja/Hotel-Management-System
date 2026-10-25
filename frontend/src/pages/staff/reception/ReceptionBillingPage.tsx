import React, { useState } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { DollarSign, Search, AlertCircle, Info, Printer, CheckCircle2 } from 'lucide-react';

/** Matches BillingDtos.InvoiceDto exactly */
interface Invoice {
  id: string;
  bookingId: string;
  hotelId: string;
  guestId: string;
  guestName: string;
  roomCharges: number;
  taxAmount: number;
  serviceCharges: number;
  discount: number;
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentReference?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  PAID: 'badge-green',
  UNPAID: 'badge-amber',
  REFUNDED: 'badge-blue',
  FAILED: 'badge-rose',
};

export const ReceptionBillingPage: React.FC = () => {
  const [bookingId, setBookingId] = useState('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = bookingId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setInvoice(null);

    try {
      const res = await api.get(`/api/v1/bookings/${id}/invoice`);
      setInvoice(res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('No invoice found for this booking ID. The checkout may not yet have been processed.');
      } else if (err?.response?.status === 403) {
        setError('Access denied. You may not view this invoice.');
      } else {
        setError(err?.response?.data?.message || 'Failed to retrieve invoice. Please check the booking ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val?: number | null) =>
    val != null ? `$${Number(val).toFixed(2)}` : '—';

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-aurevia-forest" />
          Billing &amp; Payment Status
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Look up an invoice by booking reference ID</p>
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Invoices are generated automatically when a guest checks out. Enter the full booking ID to retrieve the invoice.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Enter full booking ID…"
            value={bookingId}
            onChange={e => setBookingId(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary gap-2" disabled={loading || !bookingId.trim()}>
          <Search className="w-4 h-4" />
          Look Up
        </button>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {loading && <LoadingSkeleton variant="text-block" />}

      {!loading && searched && !invoice && !error && (
        <div className="text-center py-12 text-slate-400 text-sm">No invoice returned.</div>
      )}

      {invoice && (
        <div className="card card-padding space-y-5 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-slate-800">Invoice</h3>
            <button onClick={() => window.print()} className="btn-ghost gap-2 text-sm print:hidden">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Key fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Invoice ID</p>
              <p className="font-mono text-slate-700 font-medium text-xs mt-0.5">
                #{String(invoice.id).slice(-10).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Booking Ref</p>
              <p className="font-mono text-slate-700 font-medium text-xs mt-0.5">
                #{String(invoice.bookingId).slice(-10).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guest</p>
              <p className="text-slate-700 mt-0.5">{invoice.guestName || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Payment Status</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`badge ${statusBadge[invoice.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                  {invoice.paymentStatus}
                </span>
                {invoice.paymentStatus === 'PAID' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>
            {invoice.paymentMethod && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Payment Method</p>
                <p className="text-slate-700 mt-0.5">{invoice.paymentMethod}</p>
              </div>
            )}
            {invoice.paymentReference && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Payment Reference</p>
                <p className="font-mono text-slate-700 text-xs mt-0.5">{invoice.paymentReference}</p>
              </div>
            )}
            {invoice.paidAt && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Paid At</p>
                <p className="text-slate-700 mt-0.5">{fmtDate(invoice.paidAt)}</p>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Room Charges</span>
              <span className="font-medium text-slate-700">{fmt(invoice.roomCharges)}</span>
            </div>
            {invoice.serviceCharges != null && invoice.serviceCharges > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Service Charges</span>
                <span className="font-medium text-slate-700">{fmt(invoice.serviceCharges)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Taxes</span>
              <span className="font-medium text-slate-700">{fmt(invoice.taxAmount)}</span>
            </div>
            {invoice.discount != null && invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount</span>
                <span className="font-medium text-emerald-600">−{fmt(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-2">
              <span className="text-slate-800">Total</span>
              <span className="text-aurevia-forest">{fmt(invoice.totalAmount)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Invoice created: {fmtDate(invoice.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceptionBillingPage;
