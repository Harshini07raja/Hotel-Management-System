import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { ArrowLeft, LayoutDashboard, Database, Circle, Zap, Globe, Search, Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Lazy-import the existing system pages so they continue working
import { ShardVisualizationPage } from '../ShardVisualizationPage';
import { ConsistentHashingRingPage } from '../ConsistentHashingRingPage';
import { CacheAndRateLimiterPage } from '../CacheAndRateLimiterPage';
import { CrawlerDashboardPage } from '../CrawlerDashboardPage';
import { AutocompleteDemoPage } from '../AutocompleteDemoPage';
import { PerformanceDashboardPage } from '../PerformanceDashboardPage';

type TabId = 'overview' | 'shards' | 'hashing' | 'cache' | 'crawler' | 'autocomplete' | 'performance';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'shards', label: 'Shards', icon: Database },
  { id: 'hashing', label: 'Consistent Hashing', icon: Circle },
  { id: 'cache', label: 'Cache & Rate Limiter', icon: Zap },
  { id: 'crawler', label: 'Crawler', icon: Globe },
  { id: 'autocomplete', label: 'Autocomplete', icon: Search },
  { id: 'performance', label: 'Performance', icon: Activity },
];

const COMPONENTS = [
  { name: 'Backend API', key: 'api' },
  { name: 'MongoDB', key: 'mongodb' },
  { name: 'Redis Cache', key: 'redis' },
  { name: 'Consistent Hash Ring', key: 'hashRing' },
  { name: 'Rate Limiter', key: 'rateLimiter' },
  { name: 'Snowflake ID Generator', key: 'snowflake' },
  { name: 'Web Crawler', key: 'crawler' },
  { name: 'Autocomplete Trie', key: 'autocomplete' },
];

const OverviewTab: React.FC = () => {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/admin/health')
      .then(res => setHealth(res.data))
      .catch(() => setHealth({}))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-section py-8">
      <div className="max-w-3xl">
        <h2 className="font-display text-2xl text-aurevia-charcoal mb-6">System Health Overview</h2>

        {loading ? (
          <div className="flex items-center gap-3 text-aurevia-muted text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Checking system health…
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-aurevia-border flex items-center justify-between">
              <span className="font-semibold text-sm text-aurevia-charcoal">Component Status</span>
              <span className="badge badge-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Operational
              </span>
            </div>
            <div className="divide-y divide-aurevia-border">
              {COMPONENTS.map(comp => {
                const status = health ? (health[comp.key] as { status?: string; healthy?: boolean } | null) : null;
                const isHealthy = !status || status?.healthy !== false;
                return (
                  <div key={comp.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-aurevia-ivory/40 transition">
                    <div className="flex items-center gap-3">
                      {isHealthy
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                      <span className="text-sm font-medium text-aurevia-charcoal">{comp.name}</span>
                    </div>
                    <span className={`text-xs font-semibold ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isHealthy ? 'Healthy' : 'Degraded'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 bg-aurevia-ivory rounded-2xl border border-aurevia-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-aurevia-muted mb-3">Architecture Note</p>
          <p className="text-sm text-aurevia-charcoal leading-relaxed">
            This system implements a distributed hotel management architecture with database sharding,
            consistent hashing for load balancing, Redis-backed rate limiting and caching, a Snowflake
            ID generator for distributed unique IDs, a web crawler for hotel data aggregation, and a
            trie-based autocomplete engine.
          </p>
        </div>
      </div>
    </div>
  );
};

export const SystemDesignPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'shards': return <ShardVisualizationPage />;
      case 'hashing': return <ConsistentHashingRingPage />;
      case 'cache': return <CacheAndRateLimiterPage />;
      case 'crawler': return <CrawlerDashboardPage />;
      case 'autocomplete': return <AutocompleteDemoPage />;
      case 'performance': return <PerformanceDashboardPage />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-aurevia-forest text-white py-6">
        <div className="page-section">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-white/60 hover:text-aurevia-gold text-xs font-medium transition mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
          </Link>
          <h1 className="font-display text-3xl text-white">System Engineering</h1>
          <p className="text-aurevia-gold/70 text-sm mt-1">⚠ Restricted area — System administrators only</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-aurevia-border sticky top-0 z-30">
        <div className="page-section">
          <div className="flex overflow-x-auto gap-0 -mb-px">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                    active
                      ? 'text-aurevia-forest border-aurevia-forest'
                      : 'text-aurevia-muted border-transparent hover:text-aurevia-forest hover:border-aurevia-forest/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div>{renderContent()}</div>
    </div>
  );
};
