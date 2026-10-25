import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LayoutDashboard, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HKTask {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  status: 'DIRTY' | 'CLEANING' | 'CLEAN' | 'INSPECTION';
  assignedStaffName?: string;
  notes?: string;
  scheduledAt?: string;
  completedAt?: string;
}

const STATUS_BADGE: Record<string, string> = {
  DIRTY: 'bg-rose-100 text-rose-700 border-rose-200',
  CLEANING: 'bg-amber-100 text-amber-700 border-amber-200',
  CLEAN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  INSPECTION: 'bg-blue-100 text-blue-700 border-blue-200',
};

const NEXT_STATUS: Record<string, string | null> = {
  DIRTY: 'CLEANING', CLEANING: 'CLEAN', CLEAN: 'INSPECTION', INSPECTION: null,
};

const ACTION_LABEL: Record<string, string> = {
  DIRTY: 'Start Cleaning', CLEANING: 'Mark Clean', CLEAN: 'Mark Inspected',
};

function TaskCard({ task, onUpdate }: { task: HKTask; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(task.assignedStaffName || '');
  const next = NEXT_STATUS[task.status];

  const handleUpdate = async () => {
    if (!next) return;
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/v1/housekeeping/tasks/${task.id}`, {
        status: next,
        assignedStaffName: assigned || undefined,
      });
      onUpdate();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-padding flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-xl">Room {task.roomNumber}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">#{String(task.id).slice(-8).toUpperCase()}</p>
        </div>
        <span className={`badge border ${STATUS_BADGE[task.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {task.status}
        </span>
      </div>

      {task.notes && (
        <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg px-3 py-2">"{task.notes}"</p>
      )}

      <div>
        <label className="input-label">Assigned To</label>
        <input
          className="input-field text-sm"
          placeholder="Staff member name…"
          value={assigned}
          onChange={e => setAssigned(e.target.value)}
        />
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      {next ? (
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="btn-primary w-full text-sm"
        >
          {loading ? 'Updating…' : ACTION_LABEL[task.status]}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium py-2 bg-emerald-50 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />
          Inspection Complete
        </div>
      )}
    </div>
  );
}

const FILTERS = ['ALL', 'DIRTY', 'CLEANING', 'CLEAN', 'INSPECTION'] as const;

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<HKTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/housekeeping/tasks')
      .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    DIRTY: tasks.filter(t => t.status === 'DIRTY').length,
    CLEANING: tasks.filter(t => t.status === 'CLEANING').length,
    CLEAN: tasks.filter(t => t.status === 'CLEAN').length,
    INSPECTION: tasks.filter(t => t.status === 'INSPECTION').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-aurevia-forest" />
            My Tasks
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{tasks.length} total task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchTasks} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Dirty', count: counts.DIRTY, color: 'border-rose-200 bg-rose-50', text: 'text-rose-700' },
          { label: 'In Progress', count: counts.CLEANING, color: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
          { label: 'Clean', count: counts.CLEAN, color: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Inspected', count: counts.INSPECTION, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
            <p className={`text-xs font-medium ${s.text} opacity-80`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-aurevia-forest text-aurevia-gold border-aurevia-forest'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {f === 'ALL' ? `All (${tasks.length})` : `${f} (${counts[f as keyof typeof counts] ?? 0})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'ALL' ? 'No tasks found' : `No ${filter.toLowerCase()} rooms`}
          description={filter === 'ALL' ? 'No housekeeping tasks are currently assigned.' : `No rooms with status: ${filter}`}
          icon={LayoutDashboard}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
