import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { CheckSquare, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface HKTask { id: string; roomNumber: string; status: string; assignedStaffName?: string; notes?: string; }

function InspectCard({ task, onUpdate }: { task: HKTask; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(task.assignedStaffName || '');
  const handleUpdate = async () => {
    setLoading(true); setError(null);
    try {
      await api.patch(`/api/v1/housekeeping/tasks/${task.id}`, { status: 'INSPECTION', assignedStaffName: assigned || undefined });
      onUpdate();
    } catch (e: any) { setError(e?.response?.data?.message || 'Update failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="card card-padding flex flex-col gap-3 border-emerald-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-xl">Room {task.roomNumber}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">#{String(task.id).slice(-8).toUpperCase()}</p>
        </div>
        <span className="badge border bg-emerald-100 text-emerald-700 border-emerald-200">CLEAN</span>
      </div>
      {task.notes && <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg px-3 py-2">"{task.notes}"</p>}
      <div>
        <label className="input-label">Inspector</label>
        <input className="input-field text-sm" placeholder="Inspector name…" value={assigned} onChange={e => setAssigned(e.target.value)} />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      <button onClick={handleUpdate} disabled={loading} className="btn-primary w-full text-sm">
        {loading ? 'Updating…' : 'Mark Inspected'}
      </button>
    </div>
  );
}

function InspectedCard({ task }: { task: HKTask }) {
  return (
    <div className="card card-padding flex flex-col gap-2 bg-blue-50/30 border-blue-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-xl">Room {task.roomNumber}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">#{String(task.id).slice(-8).toUpperCase()}</p>
        </div>
        <span className="badge border bg-blue-100 text-blue-700 border-blue-200">INSPECTED</span>
      </div>
      {task.assignedStaffName && <p className="text-xs text-slate-500">Cleaned by: <span className="font-medium">{task.assignedStaffName}</span></p>}
      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium py-2 bg-emerald-50 rounded-xl justify-center">
        <CheckCircle2 className="w-4 h-4" /> Ready for guests
      </div>
    </div>
  );
}

export const CleanReadyPage: React.FC = () => {
  const [tasks, setTasks] = useState<HKTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(() => {
    setLoading(true); setError(null);
    api.get('/api/v1/housekeeping/tasks')
      .then(res => {
        const all: HKTask[] = Array.isArray(res.data) ? res.data : [];
        setTasks(all.filter(t => t.status === 'CLEAN' || t.status === 'INSPECTION'));
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const awaitingInspection = tasks.filter(t => t.status === 'CLEAN');
  const inspected = tasks.filter(t => t.status === 'INSPECTION');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
            Clean & Ready
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{tasks.length} room{tasks.length !== 1 ? 's' : ''} clean or inspected</p>
        </div>
        <button onClick={fetchTasks} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState title="No clean rooms yet" description="Rooms will appear here once cleaning is complete." icon={CheckSquare} />
      ) : (
        <div className="space-y-6">
          {awaitingInspection.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Awaiting Inspection ({awaitingInspection.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {awaitingInspection.map(task => <InspectCard key={task.id} task={task} onUpdate={fetchTasks} />)}
              </div>
            </div>
          )}
          {inspected.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Inspected & Ready ({inspected.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspected.map(task => <InspectedCard key={task.id} task={task} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CleanReadyPage;
