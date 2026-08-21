'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

type Device = {
  id: string;
  device_id: string;
  label: string | null;
  last_seen: string;
  created_at: string;
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleUpdateLabel = async (device: Device, label: string) => {
    await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: device.device_id, label }),
    });
    setDevices((prev) =>
      prev.map((d) =>
        d.device_id === device.device_id ? { ...d, label } : d
      )
    );
  };

  const handleDelete = async (deviceId: string) => {
    await fetch(`/api/devices?device_id=${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
    });
    setDevices((prev) => prev.filter((d) => d.device_id !== deviceId));
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Devices</h1>

      {devices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No devices registered yet
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onUpdateLabel={handleUpdateLabel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceCard({
  device,
  onUpdateLabel,
  onDelete,
}: {
  device: Device;
  onUpdateLabel: (device: Device, label: string) => void;
  onDelete: (deviceId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(device.label || '');

  const handleSave = () => {
    onUpdateLabel(device, label);
    setEditing(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="px-3 py-1 bg-background border rounded text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 text-sm bg-card border rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-medium">
                  {device.label || device.device_id}
                </h3>
                {device.label && (
                  <span className="text-xs text-muted-foreground font-mono">
                    ({device.device_id})
                  </span>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          {!editing && !device.label && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {device.device_id}
            </p>
          )}
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>Last seen: {formatDate(device.last_seen)}</span>
            <span>Registered: {formatDate(device.created_at)}</span>
          </div>
        </div>
        <button
          onClick={() => onDelete(device.device_id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
