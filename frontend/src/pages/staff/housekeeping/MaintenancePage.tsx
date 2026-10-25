import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Wrench, RefreshCw, AlertCircle, CheckCircle2, Plus } from 'lucide-react';

interface HKTask { id: string; roomNumber: string; status: string; assignedStaffName?: string; notes?: string; scheduledAt?: string; }
interface Hotel { id: string; name: string; city: string; }
interface Room  { id: string; roomNumber: string; roomType: string; }

const MAINTENANCE_KEYWORDS = ['maintenance', 'repair', 'broken', 'leak', 'fix', 'issue', 'fault', 'damage'];

export const MaintenancePage: React.FC = () => {
  const [tasks, setTasks] = useState<HKTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formHotelId, setFormHotelId] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const fetchTasks = useCallback(() => {
    setLoading(true); setError(null);
    api.get('/api/v1/housekeeping/tasks')
      .then(res => {
        const all: HKTask[] = Array.isArray(res.data) ? res.data : [];
        setTasks(all.filter(t =>
          MAINTENANCE_KEYWORDS.some(kw => (t.notes || '').toLowerCase().includes(kw))
        ));
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    api.get('/api/v1/hotels')
      .then(res => {
        const list: Hotel[] = Array.isArray(res.data) ? res.data : [];
        setHotels(list);
        if (list.length > 0) setFormHotelId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!formHotelId) return;
    setRoomsLoading(true);
    api.get(`/api/v1/hotels/${formHotelId}/rooms`)
      .then(res => {
        const list: Room[] = Array.isArray(res.data) ? res.data : [];
        setRooms(list);
        if (list.length > 0) setFormRoomId(list[0].id);
      })
      .catch(() => setRooms([]))
      .finally(() => setRoomsLoading(false));
  }, [formHotelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHotelId || !formRoomId || !formNotes.trim()) {
      setFormError('Please fill in all fields.'); return;
    }
    const selectedRoom = rooms.find(r => r.id === formRoomId);
    if (!selectedRoom) { setFormError('Room not found.'); return; }
    setFormLoading(true); setFormError(null);
    try {
      await api.post(
        `/api/v1/housekeeping/tasks?hotelId=${formHotelId}&roomId=${formRoomId}&roomNumber=${selectedRoom.roomNumber}&status=DIRTY&notes=${encodeURIComponent(formNotes.trim())}`
      );
      setFormSuccess(true);
      setFormNotes('');
      fetchTasks();
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (e: any) {
      setFormError(e?.response?.data?.message || 'Failed to create maintenance task.');
    } finally {
      setFormLoading(false);
    }
  };

  const statusBadge: Record<string, string> = {
    DIRTY: 'bg-rose-100 text-rose-700', CLEANING: 'bg-amber-100 text-amber-700',
    CLEAN: 'bg-emerald-100 text-emerald-700', INSPECTION: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-600" />
            Maintenance
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Rooms with maintenance issues</p>
        </div>
        <button onClick={() => setShowForm(f => !f)} className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      {/* Report form */}
      {showForm && (
        <div className="card card-padding max-w-lg space-y-4">
          <h3 className="font-semibold text-slate-700">Report Maintenance Issue</h3>
          {formSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />Maintenance task created successfully.
            </div>
          )}
          {formError && <p className="text-sm text-rose-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="input-label">Hotel</label>
              <select className="input-field text-sm" value={formHotelId} onChange={e => setFormHotelId(e.target.value)}>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Room</label>
              {roomsLoading ? (
                <div className="skeleton h-10 rounded-xl" />
              ) : (
                <select className="input-field text-sm" value={formRoomId} onChange={e => setFormRoomId(e.target.value)}>
                  {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType})</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="input-label">Issue Description</label>
              <textarea
                className="input-field text-sm min-h-[80px] resize-y"
                placeholder="Describe the maintenance issue…"
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={formLoading} className="btn-primary text-sm gap-2">
                {formLoading ? 'Submitting…' : 'Create Task'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      {loading ? (
        <LoadingSkeleton variant="list-item" count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState title="No maintenance tasks" description="No rooms have reported maintenance issues. Use 'Report Issue' to log one." icon={Wrench} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Notes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">Room {t.roomNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusBadge[t.status] || 'bg-slate-100 text-slate-600'}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{t.notes || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{t.assignedStaffName || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{t.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString() : '—'}</td>
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
export default MaintenancePage;
