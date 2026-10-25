import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { HousekeepingTask } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { RoomStatusBadge } from '../../components/ui/RoomStatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Sparkles, AlertTriangle, CheckSquare, Clock, RefreshCw, User } from 'lucide-react';

type TaskStatus = 'DIRTY' | 'CLEANING' | 'CLEAN' | 'INSPECTION';

export const HousekeepingPage: React.FC = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | TaskStatus>('ALL');
  const [assignInputs, setAssignInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string } | null>(null);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api.get('/api/v1/housekeeping/tasks')
      .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateTask = async (taskId: string, patch: Partial<HousekeepingTask>) => {
    setUpdatingId(taskId);
    try {
      await api.patch(`/api/v1/housekeeping/tasks/${taskId}`, patch);
      fetchTasks();
      setFeedback({ id: taskId, msg: 'Updated!' });
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback({ id: taskId, msg: 'Failed to update.' });
      setTimeout(() => setFeedback(null), 2000);
    } finally {
      setUpdatingId(null);
    }
  };

  const dirty = tasks.filter(t => t.status === 'DIRTY').length;
  const cleaning = tasks.filter(t => t.status === 'CLEANING').length;
  const clean = tasks.filter(t => t.status === 'CLEAN').length;
  const inspection = tasks.filter(t => t.status === 'INSPECTION').length;

  const displayed = activeTab === 'ALL' ? tasks : tasks.filter(t => t.status === activeTab);

  const TABS: Array<{ key: 'ALL' | TaskStatus; label: string; count: number }> = [
    { key: 'ALL', label: 'All', count: tasks.length },
    { key: 'DIRTY', label: 'Dirty', count: dirty },
    { key: 'CLEANING', label: 'Cleaning', count: cleaning },
    { key: 'CLEAN', label: 'Clean', count: clean },
    { key: 'INSPECTION', label: 'Inspection', count: inspection },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-aurevia-forest text-white py-6">
        <div className="page-section">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-1">Staff Portal</p>
              <h1 className="font-display text-3xl text-white">Housekeeping</h1>
              <p className="text-white/60 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={fetchTasks} className="flex items-center gap-2 text-xs text-white/60 hover:text-aurevia-gold transition px-3 py-2 rounded-lg hover:bg-white/5">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="page-section py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Dirty Rooms" value={dirty} icon={<AlertTriangle className="w-5 h-5" />} />
          <MetricCard label="Cleaning Now" value={cleaning} icon={<Clock className="w-5 h-5" />} />
          <MetricCard label="Clean & Ready" value={clean} icon={<CheckSquare className="w-5 h-5" />} />
          <MetricCard label="Inspection" value={inspection} icon={<Sparkles className="w-5 h-5" />} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-aurevia-ivory rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? 'bg-aurevia-forest text-white shadow-sm' : 'text-aurevia-muted hover:text-aurevia-charcoal'}`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Task cards */}
        {loading ? (
          <LoadingSkeleton count={6} variant="list-item" />
        ) : displayed.length === 0 ? (
          <EmptyState title="No tasks" description={`No ${activeTab === 'ALL' ? '' : activeTab.toLowerCase() + ' '}rooms to show.`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(task => {
              const isBusy = updatingId === task.id;
              const fb = feedback?.id === task.id ? feedback.msg : null;

              return (
                <div key={task.id} className="card card-padding space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-aurevia-charcoal">Room {task.roomNumber}</span>
                    <RoomStatusBadge status={task.status} />
                  </div>

                  <div className="space-y-1 text-sm">
                    {task.hotelName && <p className="text-aurevia-muted text-xs">{task.hotelName}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-aurevia-muted">
                      <User className="w-3.5 h-3.5" />
                      {task.assignedStaffName || <span className="italic">Unassigned</span>}
                    </div>
                    {task.notes && <p className="text-xs text-aurevia-muted">📝 {task.notes}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-aurevia-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {task.scheduledAt ? new Date(task.scheduledAt).toLocaleString() : '—'}
                    </div>
                    {task.completedAt && (
                      <p className="text-xs text-emerald-600">✓ Completed {new Date(task.completedAt).toLocaleString()}</p>
                    )}
                  </div>

                  {/* Staff assignment */}
                  <div className="flex gap-2">
                    <input
                      className="input-field py-1.5 text-xs flex-1"
                      placeholder="Assign staff name…"
                      value={assignInputs[task.id] || ''}
                      onChange={e => setAssignInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => updateTask(task.id, { assignedStaffName: assignInputs[task.id] || '' })}
                      disabled={isBusy}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      Assign
                    </button>
                  </div>

                  {/* Feedback */}
                  {fb && <p className="text-xs text-emerald-600 font-medium">{fb}</p>}

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-aurevia-border">
                    {task.status === 'DIRTY' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'CLEANING' })}
                        disabled={isBusy}
                        className="btn-primary w-full text-xs py-2"
                      >
                        {isBusy ? 'Updating…' : '▶ Start Cleaning'}
                      </button>
                    )}
                    {task.status === 'CLEANING' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'CLEAN' })}
                        disabled={isBusy}
                        className="btn-gold w-full text-xs py-2"
                      >
                        {isBusy ? 'Updating…' : '✓ Mark Clean'}
                      </button>
                    )}
                    {task.status === 'CLEAN' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'INSPECTION' })}
                        disabled={isBusy}
                        className="btn-ghost w-full text-xs py-2"
                      >
                        {isBusy ? 'Updating…' : '🔍 Mark for Inspection'}
                      </button>
                    )}
                    {task.status === 'INSPECTION' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'CLEAN' })}
                        disabled={isBusy}
                        className="btn-primary w-full text-xs py-2"
                      >
                        {isBusy ? 'Updating…' : '✓ Complete Inspection'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
