import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BedDouble, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Hotel { id: string; name: string; city: string; }
interface Room  { id: string; roomNumber: string; roomType: string; nightlyPrice: number; capacity: number; status: string; }

const tomorrow = (() => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();
const today = new Date().toISOString().split('T')[0];

export const RoomAvailabilityPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hotels list
  useEffect(() => {
    api.get('/api/v1/hotels')
      .then(res => {
        const list: Hotel[] = Array.isArray(res.data) ? res.data : [];
        setHotels(list);
        if (list.length > 0) setSelectedHotelId(list[0].id);
      })
      .catch(() => setError('Failed to load hotels.'))
      .finally(() => setHotelsLoading(false));
  }, []);

  const fetchRooms = useCallback(() => {
    if (!selectedHotelId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/api/v1/hotels/${selectedHotelId}/rooms`),
      api.get(`/api/v1/availability?hotelId=${selectedHotelId}&checkInDate=${today}&checkOutDate=${tomorrow}&guests=1`),
    ])
      .then(([roomsRes, availRes]) => {
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        const avail: Room[] = Array.isArray(availRes.data) ? availRes.data : [];
        setAvailableIds(new Set(avail.map(r => r.id)));
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load room data.'))
      .finally(() => setLoading(false));
  }, [selectedHotelId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const typeLabels: Record<string, string> = {
    STANDARD: 'badge-slate', DELUXE: 'badge-gold', SUITE: 'badge-green', FAMILY: 'badge-blue',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-aurevia-forest" />
            Room Availability
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Tonight's room status</p>
        </div>
        <button onClick={fetchRooms} disabled={loading} className="btn-ghost gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Hotel selector */}
      {hotelsLoading ? (
        <div className="skeleton h-10 w-64 rounded-xl" />
      ) : (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Property:</label>
          <select
            className="input-field w-auto text-sm"
            value={selectedHotelId}
            onChange={e => setSelectedHotelId(e.target.value)}
          >
            {hotels.map(h => (
              <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Summary bar */}
      {!loading && rooms.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">{availableIds.size} Available</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">{rooms.length - availableIds.size} Occupied</span>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">{rooms.length} Total Rooms</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState title="No rooms found" description="This hotel has no rooms configured." icon={BedDouble} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {rooms.map(room => {
            const isAvailable = availableIds.has(room.id);
            return (
              <div
                key={room.id}
                className={`card card-padding flex flex-col gap-2 ${isAvailable ? 'border-emerald-200' : 'border-amber-200 bg-amber-50/30'}`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-bold text-slate-800 text-lg">#{room.roomNumber}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>
                <span className={typeLabels[room.roomType] || 'badge-slate'}>{room.roomType}</span>
                <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                  <p>{room.capacity} guest{room.capacity !== 1 ? 's' : ''}</p>
                  <p className="font-semibold text-slate-700">${room.nightlyPrice}/night</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomAvailabilityPage;
