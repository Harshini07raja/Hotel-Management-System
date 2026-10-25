import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Search, RefreshCw, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

export const AdminGuestsPage: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchGuests = () => {
    setLoading(true);
    // Load guests from bookings data (deduplicated by guestId)
    api.get('/api/v1/bookings')
      .then(res => {
        const bookings = res.data as any[];
        const map = new Map<string, Guest>();
        bookings.forEach((b: any) => {
          if (!map.has(b.guestId)) {
            map.set(b.guestId, {
              id: b.guestId,
              name: b.guestName,
              email: b.guestEmail,
              role: 'GUEST',
            });
          }
        });
        setGuests(Array.from(map.values()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGuests(); }, []);

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container py-8">
      <div className="page-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-aurevia-gold font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-display text-display-md text-aurevia-charcoal">Guest Management</h1>
          </div>
          <button onClick={fetchGuests} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Guests" value={guests.length} icon={<Users className="w-5 h-5" />} />
          <MetricCard label="Active" value={guests.length} icon={<UserCheck className="w-5 h-5" />} />
          <MetricCard label="Avg Bookings" value="—" icon={<Calendar className="w-5 h-5" />} sub="per guest" />
          <MetricCard label="Verified" value={guests.length} icon={<Mail className="w-5 h-5" />} />
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-aurevia-border">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-aurevia-muted" />
              <input
                className="input-field pl-9 py-2 text-sm"
                placeholder="Search guests by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-4"><LoadingSkeleton count={5} variant="list-item" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No guests found" description="No guests match your search." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-aurevia-ivory border-b border-aurevia-border">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Role', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-aurevia-charcoal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurevia-border">
                  {filtered.map(g => (
                    <tr key={g.id} className="hover:bg-aurevia-ivory/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-aurevia-charcoal">{g.name}</td>
                      <td className="px-4 py-3 text-aurevia-muted">
                        <a href={`mailto:${g.email}`} className="flex items-center gap-1 hover:text-aurevia-forest">
                          <Mail className="w-3.5 h-3.5" />{g.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-aurevia-muted">{g.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-green">{g.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/bookings`} className="btn-link text-xs">View Bookings →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-aurevia-border text-xs text-aurevia-muted">
                Showing {filtered.length} of {guests.length} guests
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
