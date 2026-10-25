import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CheckCircle2, User, Shield, Phone, Mail, Calendar, Badge, Save } from 'lucide-react';

const SIDEBAR_LINKS = [
  { label: 'Overview', href: '/my-account', icon: '🏠' },
  { label: 'My Bookings', href: '/my-account/bookings', icon: '📅' },
  { label: 'Notifications', href: '/my-account/notifications', icon: '🔔' },
  { label: 'Profile', href: '/my-account/profile', icon: '👤', active: true },
];

const ROLE_LABEL: Record<string, string> = {
  GUEST: 'Guest Member',
  RECEPTIONIST: 'Receptionist',
  HOUSEKEEPING: 'Housekeeping Staff',
  ADMIN: 'Administrator',
};

export const GuestProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/v1/guests/me')
      .then(res => {
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
      })
      .catch(() => {
        // Fallback to auth context
        if (user) {
          setName(user.name || '');
          setPhone(user.phone || '');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put('/api/v1/guests/me', { name, phone });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="page-container bg-aurevia-ivory py-8">
      <div className="page-section">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl border border-aurevia-border p-3 sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-aurevia-muted px-3 py-2">My Account</p>
              {SIDEBAR_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition mb-0.5 ${
                    link.active
                      ? 'bg-aurevia-forest text-white'
                      : 'text-aurevia-charcoal hover:bg-aurevia-ivory'
                  }`}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {loading ? (
              <LoadingSkeleton count={4} variant="text-block" />
            ) : (
              <div className="space-y-5">
                {/* Profile header card */}
                <div className="card card-padding">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-aurevia-gold text-aurevia-forest flex items-center justify-center font-display text-3xl font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-display text-2xl text-aurevia-charcoal">{name}</h1>
                      <p className="text-sm text-aurevia-muted flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" /> {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="badge badge-green">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                        <span className="badge badge-gold">{ROLE_LABEL[user?.role || 'GUEST'] || 'Member'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit form */}
                <div className="card card-padding">
                  <h2 className="font-semibold text-aurevia-charcoal mb-5">Edit Profile</h2>

                  {success && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-sm mb-4">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile updated successfully.
                    </div>
                  )}
                  {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm mb-4">{error}</div>
                  )}

                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="input-label" htmlFor="profile-name">
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        className="input-field"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="profile-email">
                        Email Address <span className="text-aurevia-muted font-normal">(read-only)</span>
                      </label>
                      <input
                        id="profile-email"
                        className="input-field opacity-60 cursor-not-allowed"
                        value={user?.email || ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="profile-phone">
                        Phone Number
                      </label>
                      <input
                        id="profile-phone"
                        className="input-field"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        type="tel"
                      />
                    </div>
                    <div>
                      <label className="input-label">
                        Account Role <span className="text-aurevia-muted font-normal">(read-only)</span>
                      </label>
                      <input
                        className="input-field opacity-60 cursor-not-allowed"
                        value={ROLE_LABEL[user?.role || 'GUEST'] || 'Member'}
                        readOnly
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* Account info */}
                <div className="card card-padding">
                  <h2 className="font-semibold text-aurevia-charcoal mb-4">Account Information</h2>
                  <dl className="space-y-3 text-sm">
                    {[
                      { label: 'Account Type', value: ROLE_LABEL[user?.role || 'GUEST'] || 'Member', icon: Shield },
                      { label: 'Account Status', value: 'Active & Verified', icon: CheckCircle2 },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-aurevia-border last:border-0">
                          <dt className="flex items-center gap-2 text-aurevia-muted">
                            <Icon className="w-4 h-4" /> {item.label}
                          </dt>
                          <dd className="font-medium text-aurevia-charcoal">{item.value}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
