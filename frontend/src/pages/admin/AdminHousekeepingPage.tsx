import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { HousekeepingTask } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { RoomStatusBadge } from '../../components/ui/RoomStatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Sparkles, CheckSquare, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export const AdminHousekeepingPage: React.FC = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchTasks = () => {
    setLoading(true);
    api.get('/api/v1/housekeeping/tasks')
      .then(res => setTasks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const dirty = tasks.filter(t => t.status === 'DIRTY').length;
  const cleaning = tasks.filter(t => t.status === 'CLEANING').length;
  const clean = tasks.filter(t => t.status === 'CLEAN').length;
  const inspection = tasks.filter(t => t.status === 'INSPECTION').length;

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="page-container py-8">
      <div className="page-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-aurevia-gold font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-display text-display-md text-aurevia-charcoal">Housekeeping Overview</h1>
          </div>
          <button onClick={fetchTasks} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Dirty Rooms" value={dirty} icon={<AlertTriangle className="w-5 h-5" />} />
          <MetricCard label="Cleaning Now" value={cleaning} icon={<Clock className="w-5 h-5" />} />
          <MetricCard label="Clean & Ready" value={clean} icon={<CheckSquare className="w-5 h-5" />} />
          <MetricCard label="Inspection" value={inspection} icon={<Sparkles className="w-5 h-5" />} />
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {['ALL', 'DIRTY', 'CLEANING', 'CLEAN', 'INSPECTION'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${filter === s ? 'bg-aurevia-forest text-white' : 'bg-white border border-aurevia-border text-aurevia-muted hover:text-aurevia-charcoal'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSkeleton count={6} variant="list-item" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No tasks" description="No housekeeping tasks match the selected filter." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(task => (
              <div key={task.id} className="card card-padding">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-xl text-aurevia-charcoal">Room {task.roomNumber}</span>
                  <RoomStatusBadge status={task.status} />
                </div>
                <p className="text-xs text-aurevia-muted mb-1">Assigned: {task.assignedStaffName || 'Unassigned'}</p>
                {task.notes && <p className="text-xs text-aurevia-muted mb-1">Notes: {task.notes}</p>}
                <p className="text-xs text-aurevia-muted">Scheduled: {new Date(task.scheduledAt).toLocaleString()}</p>
                {task.completedAt && (
                  <p className="text-xs text-emerald-600 mt-1">Completed: {new Date(task.completedAt).toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
