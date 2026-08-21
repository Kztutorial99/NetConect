'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

type Notification = {
  id: string;
  device_id: string;
  package_name: string;
  title: string | null;
  body: string | null;
  posted_at: string | null;
  received_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = async () => {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      n.package_name.toLowerCase().includes(q) ||
      n.title?.toLowerCase().includes(q) ||
      n.body?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
        >
          Clear All
        </button>
      </div>

      <input
        type="text"
        placeholder="Filter by package, title, or body..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-4 py-2 bg-card border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className="bg-card border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className="font-mono truncate">{notif.package_name}</span>
                  <span>•</span>
                  <span>{formatDate(notif.received_at)}</span>
                </div>
                {notif.title && (
                  <h3 className="font-medium truncate">{notif.title}</h3>
                )}
                {notif.body && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{notif.body}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(notif.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
