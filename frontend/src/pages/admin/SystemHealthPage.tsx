import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Server, Database, Zap, Clock } from 'lucide-react';

interface HealthData {
  status: string;
  service?: string;
  timestamp?: number;
}

interface MetricsSummary {
  totalRequests?: number;
  successfulRequests?: number;
  failedRequests?: number;
  avgLatencyMs?: number;
  p95LatencyMs?: number;
  p99LatencyMs?: number;
  requestsPerSecond?: number;
  cpuUsage?: number;
  memoryUsageMb?: number;
  errorRate?: number;
  [key: string]: unknown;
}

interface CacheStats {
  hits?: number;
  misses?: number;
  hitRate?: number;
  totalKeys?: number;
  [key: string]: unknown;
}

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, metricsRes, cacheRes] = await Promise.allSettled([
        api.get('/api/v1/admin/health'),
        api.get('/api/v1/admin/metrics'),
        api.get('/api/v1/admin/cache/stats'),
      ]);
      if (healthRes.status === 'fulfilled')  setHealth(healthRes.value.data);
      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data);
      if (cacheRes.status === 'fulfilled')   setCacheStats(cacheRes.value.data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError('Failed to load some health metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const isUp = health?.status === 'UP';

  const Stat = ({ label, value, unit = '' }: { label: string; value: unknown; unit?: string }) => (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-slate-800 font-mono">
        {value != null ? `${value}${unit}` : <span className="text-slate-400 text-sm font-sans">Not available</span>}
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            System Health
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 30s
          </p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error} Some metrics may be unavailable.
        </div>
      )}

      {/* Backend status */}
      <div className="card card-padding">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-500" />
          Backend Service
        </h3>
        {loading ? (
          <div className="skeleton h-10 rounded-xl" />
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
            <div>
              <p className={`font-bold text-lg ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                {health?.status ?? 'Unknown'}
              </p>
              <p className="text-xs text-slate-400">
                {health?.service ?? 'hotel-management-system'}
                {health?.timestamp ? ` · ${new Date(health.timestamp).toLocaleTimeString()}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Application metrics */}
      <div className="card card-padding">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-slate-500" />
          Application Metrics
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat label="Total Requests" value={metrics?.totalRequests} />
            <Stat label="Success Rate" value={metrics?.errorRate != null ? `${(100 - Number(metrics.errorRate)).toFixed(1)}` : null} unit="%" />
            <Stat label="Avg Latency" value={metrics?.avgLatencyMs} unit="ms" />
            <Stat label="p95 Latency" value={metrics?.p95LatencyMs} unit="ms" />
            <Stat label="p99 Latency" value={metrics?.p99LatencyMs} unit="ms" />
            <Stat label="Requests/sec" value={metrics?.requestsPerSecond} />
            <Stat label="CPU Usage" value={metrics?.cpuUsage} unit="%" />
            <Stat label="Memory" value={metrics?.memoryUsageMb} unit=" MB" />
          </div>
        )}
      </div>

      {/* Cache stats */}
      <div className="card card-padding">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500" />
          Redis Cache
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat label="Cache Hits" value={cacheStats?.hits} />
            <Stat label="Cache Misses" value={cacheStats?.misses} />
            <Stat label="Hit Rate" value={cacheStats?.hitRate != null ? `${(Number(cacheStats.hitRate) * 100).toFixed(1)}` : null} unit="%" />
            <Stat label="Total Keys" value={cacheStats?.totalKeys} />
          </div>
        )}
      </div>

      {/* Note about additional metrics */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-500">
          For rate-limiter statistics, shard distribution, consistent hashing ring, and performance benchmarks, visit the{' '}
          <a href="/admin/system-design" className="text-aurevia-forest font-medium hover:underline">System Design</a> section.
        </p>
      </div>
    </div>
  );
};

export default SystemHealthPage;
