import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AlertTriangle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface HKTask {
  id: string; roomNumber: string; status: string;
  assignedStaffName?: string; notes?: string;
}
function TaskCard({ task, onUpdate }: { task: HKTask; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(task.assignedStaffName || '');
  const handleUpdate = async () => {
    setLoading(true); setError(null);
    try {
      await api.patch(`/api/v1/housekeeping/tasks/${task.id}`, { status: 'CLEANING', assignedStaffName: assigned || undefined });
      onUpdate();
    } catch (e: any) { setError(e?.response?.data?.message || 'Update failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="card card-padding flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-xl">Room {task.roomNumber}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">#{String(task.id).slice(-8).toUpperCase()}</p>
        </div>
        <span className="badge border bg-rose-100 text-rose-700 border-rose-200">DIRTY</span>
      </div>
      {task.notes && <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg px-3 py-2">"{task.notes}"</p>}
      <div>
        <label className="input-label">Assigned To</label>
        <input className="input-field text-sm" placeholder="Staff member name…" value={assigned} onChange={e => setAssigned(e.target.value)} />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      <button onClick={handleUpdate} disabled={loading} className="btn-primary w-full text-sm">
        {loading ? 'Updating…' : 'Start Cleaning'}
      </button>
    </div>
  );
}

export const RoomsToCleanPage: React.FC = () => {
  const [tasks, setTasks] = useState<HKTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(() => {
    setLoading(true); setError(null);
    api.get('/api/v1/housekeeping/tasks?status=DIRTY')
      .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Rooms to Clean
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{tasks.length} room{tasks.length !== 1 ? 's' : ''} need{tasks.length === 1 ? 's' : ''} cleaning</p>
        </div>
        <button onClick={fetchTasks} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState title="All rooms are clean!" description="No rooms currently need cleaning. Check back after guest check-outs." icon={CheckCircle2} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />)}
        </div>
      )}
    </div>
  );
};
export default RoomsToCleanPage;
