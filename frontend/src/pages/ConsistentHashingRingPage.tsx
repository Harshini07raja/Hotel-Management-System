import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Zap,
  Server,
  Plus,
  Trash2,
  RefreshCw,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ConsistentHashingRingPage: React.FC = () => {
  const [ringData, setRingData] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newServerId, setNewServerId] = useState('hotel-node-4');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRing();
    runBenchmark();
  }, []);

  const fetchRing = () => {
    setLoading(true);
    api.get('/api/v1/admin/consistent-hashing/ring')
      .then((res) => setRingData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const runBenchmark = () => {
    api.get('/api/v1/admin/consistent-hashing/benchmark?sampleKeyCount=10000')
      .then((res) => setBenchmark(res.data))
      .catch(() => {});
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/api/v1/admin/consistent-hashing/servers?serverId=${newServerId}`);
      setMessage(`Server ${newServerId} successfully placed on the hash ring with 150 virtual nodes.`);
      fetchRing();
      runBenchmark();
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleRemoveServer = async (serverId: string) => {
    if (!window.confirm(`Remove server ${serverId} and redistribute its ring tokens?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/admin/consistent-hashing/servers/${serverId}`);
      setMessage(`Server ${serverId} removed. Tokens smoothly reallocated to next clockwise nodes.`);
      fetchRing();
      runBenchmark();
    } catch {} finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-500" /> Consistent Hash Ring & Server Topologies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Minimizes cache/server invalidation when hotel nodes scale out or fail. Employs 150 virtual nodes per server.
          </p>
        </div>

        <button
          onClick={() => { fetchRing(); runBenchmark(); }}
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Recalculate Ring
        </button>
      </div>

      {message && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Ring Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Physical Servers</div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {ringData?.activeServers?.length || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Node cluster members</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Virtual Nodes per Server</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {ringData?.virtualNodesPerServer || 150}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ensures uniform distribution</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ring Tokens</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {ringData?.totalRingTokens || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">2^64 MD5 token space</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ring Binary Lookup</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">&lt; 5 µs</div>
          <div className="text-[11px] text-slate-400 mt-1">O(log N) TreeMap ceilingEntry</div>
        </div>
      </div>

      {/* Experiment D: Benchmark Comparison Card */}
      {benchmark && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                Experiment D: Topology Change Benchmark (10,000 Sample Keys)
              </h2>
              <p className="text-xs text-slate-500">
                Evaluation of key migration when scaling from {benchmark.initialNodeCount} nodes to {benchmark.initialNodeCount + 1} nodes.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              {benchmark.reductionInKeyMovement}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modulo Hashing Box */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-rose-900">Naive Modulo Hashing (hash % N)</span>
                <span className="text-xs font-bold text-rose-700 font-mono">{benchmark.moduloHashing.percentageMoved}% Moved</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When adding 1 node to a cluster of {benchmark.initialNodeCount}, almost ALL existing cache entries and session assignments change location.
              </p>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${benchmark.moduloHashing.percentageMoved}%` }}></div>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                <span>Keys Migrated: {benchmark.moduloHashing.keysMoved} / {benchmark.sampleKeyCount}</span>
                <span>Theoretical: {benchmark.moduloHashing.theoreticalExpectedPct}%</span>
              </div>
            </div>

            {/* Consistent Hashing Box */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-900">Consistent Hashing with Virtual Nodes</span>
                <span className="text-xs font-bold text-emerald-700 font-mono">{benchmark.consistentHashing.percentageMoved}% Moved</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only keys in the adjacent token arc are reassigned. Exactly ~1/(N+1) keys migrate, preserving ~75% of cache hits!
              </p>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${benchmark.consistentHashing.percentageMoved}%` }}></div>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                <span>Keys Migrated: {benchmark.consistentHashing.keysMoved} / {benchmark.sampleKeyCount}</span>
                <span>Theoretical: {benchmark.consistentHashing.theoreticalExpectedPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Node Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">Registered Application Server Nodes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ringData?.activeServers?.map((server: string) => (
            <div
              key={server}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900">{server}</div>
                  <div className="text-[11px] text-slate-500">
                    Requests Routed: {ringData?.serverRequestCounts?.[server] || 0}
                  </div>
                </div>
              </div>

              {ringData.activeServers.length > 1 && (
                <button
                  onClick={() => handleRemoveServer(server)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Remove server from ring"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Server Form */}
        <form onSubmit={handleAddServer} className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newServerId}
            onChange={(e) => setNewServerId(e.target.value)}
            placeholder="Node Identifier (e.g. hotel-node-4)"
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Server to Hash Ring
          </button>
        </form>
      </div>
    </div>
  );
};
