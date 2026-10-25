import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { NotificationItem } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Bell, CheckCheck, Info, Calendar, RefreshCw } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    api.get('/api/v1/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    const unread = notifications.filter(n => !n.read);
    await Promise.allSettled(unread.map(n => api.patch(`/api/v1/notifications/${n.id}/read`)));
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-container py-8 bg-aurevia-ivory">
      <div className="page-section max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-display-md text-aurevia-charcoal">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-aurevia-muted mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={fetchNotifications} className="btn-ghost p-2.5">
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="btn-ghost text-sm flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        {loading ? (
          <LoadingSkeleton count={5} variant="list-item" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="No notifications"
            description="You're all caught up! Notifications about your bookings and stays will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`card p-4 flex gap-4 transition ${
                  !n.read ? 'border-l-4 border-l-aurevia-forest bg-aurevia-ivory' : 'bg-white'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.read ? 'bg-aurevia-forest text-aurevia-gold' : 'bg-aurevia-ivory text-aurevia-muted'
                }`}>
                  {n.type?.includes('BOOKING') ? (
                    <Calendar className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.read ? 'text-aurevia-charcoal' : 'text-aurevia-muted'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-aurevia-muted whitespace-nowrap shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 leading-relaxed ${!n.read ? 'text-aurevia-charcoal' : 'text-aurevia-muted'}`}>
                    {n.message}
                  </p>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-aurevia-forest hover:text-aurevia-forest-light font-medium mt-2 transition"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
