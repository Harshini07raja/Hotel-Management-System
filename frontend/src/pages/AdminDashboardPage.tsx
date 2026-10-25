import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import {
  Building2, BedDouble, Calendar, Users, Sparkles, Receipt,
  ArrowRight, Activity, Cpu, MemoryStick, Zap, RefreshCw, LayoutDashboard
} from 'lucide-react';

interface Metrics {
  totalBookings?: number;
  totalRevenue?: number;
  activeHotels?: number;
  occupancyRate?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  p95Latency?: number;
  requestsPerSecond?: number;
  [key: string]: unknown;
}

const NAV_CARDS = [
  { label: 'Hotels', desc: 'Manage all properties', icon: Building2, href: '/admin/hotels', color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Room Inventory', desc: 'Room availability & types', icon: BedDouble, href: '/admin/rooms', color: 'text-blue-600 bg-blue-50' },
  { label: 'Bookings', desc: 'All reservations & stays', icon: Calendar, href: '/admin/bookings', color: 'text-violet-600 bg-violet-50' },
  { label: 'Guests', desc: 'Guest accounts & profiles', icon: Users, href: '/admin/guests', color: 'text-rose-600 bg-rose-50' },
  { label: 'Housekeeping', desc: 'Room cleaning tasks', icon: Sparkles, href: '/admin/housekeeping', color: 'text-amber-600 bg-amber-50' },
  { label: 'Billing & Invoices', desc: 'Revenue & payments', icon: Receipt, href: '/admin/billing', color: 'text-teal-600 bg-teal-50' },
];

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [resetDialog, setResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchMetrics = useCallback(() => {
    api.get('/api/v1/admin/metrics')
      .then(res => {
        setMetrics(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      await api.get('/api/v1/admin/seed-data');
      setFeedback('Data seeded successfully!');
      fetchMetrics();
    } catch {
      setFeedback('Seed failed. Please try again.');
    } finally {
      setSeedLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await api.post('/api/v1/admin/reset-data');
      setFeedback('All data reset successfully!');
      fetchMetrics();
    } catch {
      setFeedback('Reset failed. Please try again.');
    } finally {
      setResetLoading(false);
      setResetDialog(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-aurevia-forest text-white py-8">
        <div className="page-section">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-1">Aurevia Hotels & Resorts</p>
              <h1 className="font-display text-4xl text-white">Admin Dashboard</h1>
              <p className="text-white/60 text-sm mt-1">Business Operations Overview</p>
            </div>
            <div className="text-right text-xs text-white/40">
              <p>Auto-refreshes every 5 seconds</p>
              {lastUpdated && <p className="mt-0.5">Last updated: {lastUpdated}</p>}
              <button onClick={fetchMetrics} className="mt-2 flex items-center gap-1.5 text-aurevia-gold/80 hover:text-aurevia-gold transition ml-auto">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-section py-8 space-y-8">
        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl p-3 text-sm font-medium ${feedback.includes('successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {feedback}
          </div>
        )}

        {/* Business metrics */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-aurevia-muted mb-4">Business Overview</h2>
          {loading ? <LoadingSkeleton count={4} variant="stat-card" /> : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard accent label="Total Bookings" value={metrics.totalBookings ?? '—'} icon={<Calendar className="w-5 h-5" />} />
              <MetricCard accent label="Total Revenue" value={metrics.totalRevenue ? `$${Number(metrics.totalRevenue).toLocaleString()}` : '$—'} icon={<Receipt className="w-5 h-5" />} />
              <MetricCard accent label="Active Hotels" value={metrics.activeHotels ?? '—'} icon={<Building2 className="w-5 h-5" />} />
              <MetricCard accent label="Occupancy Rate" value={metrics.occupancyRate ? `${metrics.occupancyRate}%` : '—'} icon={<Users className="w-5 h-5" />} />
            </div>
          )}
        </section>

        {/* System health */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-aurevia-muted mb-4">System Health</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="CPU Usage" value={metrics.cpuUsage !== undefined ? `${Number(metrics.cpuUsage).toFixed(1)}%` : '—'} icon={<Cpu className="w-5 h-5" />} />
            <MetricCard label="Memory Usage" value={metrics.memoryUsage !== undefined ? `${Number(metrics.memoryUsage).toFixed(1)}%` : '—'} icon={<MemoryStick className="w-5 h-5" />} />
            <MetricCard label="P95 Latency" value={metrics.p95Latency !== undefined ? `${metrics.p95Latency}ms` : '—'} icon={<Activity className="w-5 h-5" />} />
            <MetricCard label="Requests/sec" value={metrics.requestsPerSecond !== undefined ? `${Number(metrics.requestsPerSecond).toFixed(1)}` : '—'} icon={<Zap className="w-5 h-5" />} />
          </div>
        </section>

        {/* Quick navigation */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-aurevia-muted mb-4">Management Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NAV_CARDS.map(card => (
              <Link key={card.href} to={card.href} className="card card-padding card-hover flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-aurevia-charcoal group-hover:text-aurevia-forest transition">{card.label}</p>
                  <p className="text-xs text-aurevia-muted mt-0.5">{card.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-aurevia-muted group-hover:text-aurevia-forest transition shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* System Engineering Card */}
        <section>
          <div className="bg-aurevia-forest rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-aurevia-gold/20 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-6 h-6 text-aurevia-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-white mb-1">System Engineering Dashboard</h3>
              <p className="text-white/60 text-sm">
                Distributed system monitoring, shard management, consistent hashing ring, rate limiter, crawler, autocomplete, and performance benchmarks.
              </p>
              <p className="text-aurevia-gold/60 text-xs mt-1">⚠ Restricted — System administrators only</p>
            </div>
            <Link to="/admin/system-design" className="btn-gold shrink-0 px-6 py-2.5 flex items-center gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Admin actions */}
        <section className="card card-padding">
          <h2 className="font-semibold text-aurevia-charcoal mb-1">Data Management</h2>
          <p className="text-xs text-aurevia-muted mb-4">Seed sample data or reset all data for testing purposes.</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleSeed} disabled={seedLoading} className="btn-ghost text-sm flex items-center gap-2">
              {seedLoading ? '⏳ Seeding…' : '🌱 Seed Data'}
            </button>
            <button onClick={() => setResetDialog(true)} className="btn-danger text-sm">
              ⚠ Reset All Data
            </button>
          </div>
        </section>
      </div>

      <ConfirmationDialog
        isOpen={resetDialog}
        title="Reset All Data"
        message="This will permanently delete all bookings, guests, and operational data, then reseed with demo data. This action cannot be undone."
        confirmLabel="Yes, Reset Everything"
        variant="danger"
        loading={resetLoading}
        onConfirm={handleReset}
        onCancel={() => setResetDialog(false)}
      />
    </div>
  );
};
