import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { HousekeepingTask } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Check,
  User,
  Layers,
} from 'lucide-react';

export const HousekeepingDashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    api.get('/api/v1/housekeeping/tasks')
      .then((res) => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    setActionLoading(taskId);
    try {
      await api.patch(`/api/v1/housekeeping/tasks/${taskId}`, {
        status: newStatus,
        assignedStaffName: 'Charlie (Housekeeping)',
      });
      fetchTasks();
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-500" /> Housekeeping & Sanitation Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time room hygiene state machine: DIRTY → CLEANING → CLEAN. Ensures zero uncleaned room assignments.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          {['ALL', 'DIRTY', 'CLEANING', 'CLEAN'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f} ({f === 'ALL' ? tasks.length : tasks.filter((t) => t.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-44 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No housekeeping tasks matching filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Room #{task.roomNumber}
                  </span>
                  <StatusBadge status={task.status} />
                </div>
                <div className="text-xs text-slate-500 font-mono">Hotel: {task.hotelId} • Task ID: {task.id}</div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {task.notes || 'Routine cleaning and bed preparation'}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Scheduled: {new Date(task.scheduledAt).toLocaleTimeString()}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{task.assignedStaffName || 'Unassigned'}</span>
                </div>

                <div className="space-x-1.5">
                  {task.status === 'DIRTY' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'CLEANING')}
                      disabled={actionLoading === task.id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3" /> Start Cleaning
                    </button>
                  )}

                  {task.status === 'CLEANING' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'CLEAN')}
                      disabled={actionLoading === task.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" /> Mark Clean
                    </button>
                  )}

                  {task.status === 'CLEAN' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inspected & Ready
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
