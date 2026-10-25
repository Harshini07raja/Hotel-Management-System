import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Activity,
  Zap,
  RefreshCw,
  Trash2,
  Play,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Database,
  Flame,
} from 'lucide-react';

export const CacheAndRateLimiterPage: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [rateStats, setRateStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Burst test state
  const [burstRunning, setBurstRunning] = useState(false);
  const [burstResults, setBurstResults] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/v1/admin/cache/stats'),
      api.get('/api/v1/admin/rate-limiter/stats'),
    ])
      .then(([cRes, rRes]) => {
        setCacheStats(cRes.data);
        setRateStats(rRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleClearCache = async () => {
    try {
      await api.delete('/api/v1/admin/cache/clear');
      setMessage('Cache entries evicted successfully.');
      fetchStats();
    } catch {}
  };

  const runBurstTest = async () => {
    setBurstRunning(true);
    setBurstResults(null);
    const requestsCount = 25;
    let accepted = 0;
    let rejected = 0;

    for (let i = 0; i < requestsCount; i++) {
      try {
        await api.post('/api/v1/auth/login', {
          email: 'burst-test@hotel.com',
          password: 'Password123!',
        });
        accepted++;
      } catch (err: any) {
        if (err.response?.status === 429) {
          rejected++;
        } else {
          accepted++; // Invalid credentials still consumed a token
        }
      }
    }

    setBurstResults({
      totalSent: requestsCount,
      accepted,
      rejected,
      rejectionRate: Math.round((rejected * 100.0 / requestsCount) * 100) / 100,
    });
    setBurstRunning(false);
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-emerald-500" /> Cache-Aside & Rate Limiter Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Redis sub-millisecond key-value caching paired with Token Bucket DDoS & brute-force mitigation
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Telemetry
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Redis Key-Value Store Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-bold text-slate-900">Redis Key-Value Store (Component 4)</h2>
            </div>
            <p className="text-xs text-slate-500">
              Provider: <strong className="font-mono text-slate-800">{cacheStats?.cacheProvider || 'LOCAL_IN_MEMORY_FALLBACK'}</strong>
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Evict All Cache Entries
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Cache Hit Rate</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {cacheStats?.hitRatePercentage || 0}%
            </div>
            <span className="text-[11px] text-slate-400">Sub-millisecond reads</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Cache Hits</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {cacheStats?.hitCount || 0}
            </div>
            <span className="text-[11px] text-slate-400">Database reads bypassed</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Cache Misses</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {cacheStats?.missCount || 0}
            </div>
            <span className="text-[11px] text-slate-400">Routed to Mongo Shard</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Avg Lookup Latency</span>
            <div className="text-2xl font-extrabold text-sky-600 font-mono mt-1">
              {cacheStats?.avgLookupLatencyMs || 0.1} <span className="text-sm font-normal text-slate-500">ms</span>
            </div>
            <span className="text-[11px] text-slate-400">vs 8-15ms DB disk fetch</span>
          </div>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 space-y-1">
          <div className="font-bold">Authoritative Consistency Rule:</div>
          <p className="text-slate-600">
            Stale cached availability is <strong>NEVER</strong> used as the sole authority for room bookings.
            Every booking atomically verifies inventory on the authoritative MongoDB shard to guarantee zero double bookings.
          </p>
        </div>
      </div>

      {/* Token Bucket Rate Limiter Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Token Bucket Rate Limiter (Component 1)</h2>
            </div>
            <p className="text-xs text-slate-500">
              Protects sensitive endpoints: /auth/login (capacity 10), /bookings (capacity 20), /search (capacity 60).
            </p>
          </div>

          <button
            onClick={runBurstTest}
            disabled={burstRunning}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" /> {burstRunning ? 'Simulating Burst...' : 'Simulate 25 Rapid Burst Requests'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Checked</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {rateStats?.totalChecked || 0}
            </div>
            <span className="text-[11px] text-slate-400">Inbound requests</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Accepted Requests</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {rateStats?.acceptedRequests || 0}
            </div>
            <span className="text-[11px] text-slate-400">Tokens decremented</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">HTTP 429 Rejections</span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
              {rateStats?.rejectedRequests || 0}
            </div>
            <span className="text-[11px] text-slate-400">{rateStats?.rejectionPercentage || 0}% rejected</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Check Overhead</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {rateStats?.avgLatencyMs || 0.05} <span className="text-sm font-normal text-slate-500">ms</span>
            </div>
            <span className="text-[11px] text-slate-400">Per request overhead</span>
          </div>
        </div>

        {/* Experiment G Burst Results Banner */}
        {burstResults && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              <span>Experiment G: Burst Traffic Test Completed (25 Consecutive Requests)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono pt-1 text-slate-800">
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span>Burst Allowed: </span><strong>{burstResults.accepted}</strong> (within capacity 10)
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span>HTTP 429 Dropped: </span><strong className="text-rose-600">{burstResults.rejected}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span>Rejection Rate: </span><strong>{burstResults.rejectionRate}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
