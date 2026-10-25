import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Hotel } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { DataTable } from '../../components/ui/DataTable';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, BedDouble, Calendar, Users, Search, ArrowRight, RefreshCw } from 'lucide-react';

export const AdminHotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = () => {
    setLoading(true);
    api.get('/api/v1/hotels')
      .then(res => setHotels(res.data))
      .catch(() => setError('Failed to load hotels.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHotels(); }, []);

  const columns = [
    { key: 'name', label: 'Hotel Name', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'starRating', label: 'Stars', sortable: true, render: (h: Hotel) => `${'★'.repeat(h.starRating)}` },
    { key: 'basePrice', label: 'Base Price', sortable: true, render: (h: Hotel) => `$${h.basePrice}` },
    {
      key: 'actions', label: 'Actions',
      render: (h: Hotel) => (
        <Link to={`/hotels/${h.id}`} className="btn-link text-xs">View →</Link>
      ),
    },
  ];

  return (
    <div className="page-container py-8">
      <div className="page-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-aurevia-gold font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-display text-display-md text-aurevia-charcoal">Hotels</h1>
          </div>
          <button onClick={fetchHotels} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Hotels" value={hotels.length} icon={<Building2 className="w-5 h-5" />} />
          <MetricCard label="Countries" value={new Set(hotels.map(h => h.country)).size} icon={<Search className="w-5 h-5" />} />
          <MetricCard label="Avg Base Price" value={hotels.length ? `$${Math.round(hotels.reduce((s, h) => s + h.basePrice, 0) / hotels.length)}` : '$—'} icon={<BedDouble className="w-5 h-5" />} />
          <MetricCard label="Avg Rating" value={hotels.length ? (hotels.reduce((s, h) => s + h.starRating, 0) / hotels.length).toFixed(1) : '—'} icon={<ArrowRight className="w-5 h-5" />} />
        </div>

        {loading ? (
          <LoadingSkeleton count={5} variant="list-item" />
        ) : error ? (
          <EmptyState title="Failed to load" description={error} action={<button onClick={fetchHotels} className="btn-primary">Retry</button>} />
        ) : (
          <DataTable
            columns={columns}
            data={hotels}
            keyExtractor={(h) => h.id}
            emptyMessage="No hotels found"
          />
        )}
      </div>
    </div>
  );
};
