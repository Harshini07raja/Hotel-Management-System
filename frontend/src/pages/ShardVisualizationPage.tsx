import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Layers,
  Database,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  ArrowRight,
} from 'lucide-react';

export const ShardVisualizationPage: React.FC = () => {
  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newShardId, setNewShardId] = useState('shard-3');
  const [newDbName, setNewDbName] = useState('hotel_shard_3');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchShards();
  }, []);

  const fetchShards = () => {
    setLoading(true);
    api.get('/api/v1/admin/shards/distribution')
      .then((res) => setDistribution(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAddShard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const res = await api.post(`/api/v1/admin/shards/add?shardId=${newShardId}&databaseName=${newDbName}`);
      setMessage(res.data.message);
      fetchShards();
    } catch {
      setMessage('Failed to register new shard.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-sky-500" /> Database Shard Router Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explicit deterministic shard routing layer across independent MongoDB databases. Co-locates rooms and bookings by hotelId.
          </p>
        </div>

        <button
          onClick={fetchShards}
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Stats
        </button>
      </div>

      {message && (
        <div className="bg-sky-50 border border-sky-300 text-sky-900 rounded-2xl p-4 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Aggregate Cluster Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shards</div>
          <div className="text-2xl font-extrabold text-sky-600 font-mono mt-1">{distribution?.totalShards || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Independently Addressable</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hotels Stored</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{distribution?.aggregateHotels || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Partitioned by hotelId</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Room Inventories</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{distribution?.aggregateRooms || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Co-located on Hotel Shard</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Confirmed Bookings</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{distribution?.aggregateBookings || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Zero cross-shard 2PC needed</div>
        </div>
      </div>

      {/* Live Shard Database Nodes */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Independent Shard Databases (MongoDB)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {distribution?.shards?.map((shard: any) => (
            <div
              key={shard.shardId}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-500" />
                  <span className="font-mono font-bold text-slate-900">{shard.shardId}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                  Healthy ({shard.pingMs}ms)
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Database URI Name:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{shard.databaseName}</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-50">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Hotels Partitioned:</span>
                  <span className="font-bold text-slate-900">{shard.hotelCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Rooms Managed:</span>
                  <span className="font-bold text-slate-900">{shard.roomCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Reservations Stored:</span>
                  <span className="font-bold text-slate-900">{shard.bookingCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Guest Accounts:</span>
                  <span className="font-bold text-slate-900">{shard.guestCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Invoices & Receipts:</span>
                  <span className="font-bold text-slate-900">{shard.invoiceCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experiment C: Dynamic Shard Addition Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-500" /> Scalability Experiment C: Add New Database Shard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically expand the routing layer with a new database instance and evaluate key redistribution.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddShard} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 mb-1">New Shard ID</label>
            <input
              type="text"
              required
              value={newShardId}
              onChange={(e) => setNewShardId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Target Mongo Database Name</label>
            <input
              type="text"
              required
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50"
            >
              {adding ? 'Registering Shard...' : 'Register Shard in Routing Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
