import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { History as HistoryIcon, RefreshCw, Search, AlertCircle } from 'lucide-react';

interface HKTask { id: string; roomNumber: string; status: string; assignedStaffName?: string; notes?: string; completedAt?: string; scheduledAt?: string; }

export const HistoryPage: React.FC = () => {
  const [tasks, setTasks] = useState<HKTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchTasks = useCallback(() => {
    setLoading(true); setError(null);
    api.get('/api/v1/housekeeping/tasks')
      .then(res => {
        const all: HKTask[] = Array.isArray(res.data) ? res.data : [];
        const completed = all
          .filter(t => t.status === 'INSPECTION')
          .sort((a, b) => {
            const da = new Date(b.completedAt || b.scheduledAt || 0).getTime();
            const db = new Date(a.completedAt || a.scheduledAt || 0).getTime();
            return da - db;
          });
        setTasks(completed);
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = search.trim()
    ? tasks.filter(t => t.roomNumber.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const formatDate = (ds?: string) => {
    if (!ds) return '—';
    try { return new Date(ds).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return ds; }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-blue-600" />
            Task History
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{tasks.length} completed task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchTasks} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input-field pl-9 text-sm"
          placeholder="Filter by room number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      {loading ? (
        <LoadingSkeleton variant="list-item" count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No completed tasks"
          description={search ? `No completed tasks for room "${search}".` : 'Inspected tasks will appear here.'}
          icon={HistoryIcon}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cleaned By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Task Ref</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">Room {t.roomNumber}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-100 text-blue-700 border border-blue-200">{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.assignedStaffName || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{t.notes || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{String(t.id).slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(t.completedAt || t.scheduledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default HistoryPage;
