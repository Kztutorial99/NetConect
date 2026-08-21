'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

type Package = {
  package_name: string;
  blocked: boolean;
  note: string | null;
  updated_at: string;
};

type FilterMode = 'blocklist' | 'allowlist';

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('blocklist');
  const [loading, setLoading] = useState(true);
  const [newPackage, setNewPackage] = useState('');

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages);
        setFilterMode(data.filter_mode);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleToggleBlocked = async (pkg: Package) => {
    await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_name: pkg.package_name,
        blocked: !pkg.blocked,
      }),
    });
    setPackages((prev) =>
      prev.map((p) =>
        p.package_name === pkg.package_name
          ? { ...p, blocked: !p.blocked, updated_at: new Date().toISOString() }
          : p
      )
    );
  };

  const handleDelete = async (packageName: string) => {
    await fetch(`/api/packages?name=${encodeURIComponent(packageName)}`, {
      method: 'DELETE',
    });
    setPackages((prev) => prev.filter((p) => p.package_name !== packageName));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage) return;

    await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_name: newPackage,
        blocked: false,
      }),
    });

    setPackages((prev) => [
      { package_name: newPackage, blocked: false, note: null, updated_at: new Date().toISOString() },
      ...prev,
    ]);
    setNewPackage('');
  };

  const handleModeChange = async (mode: FilterMode) => {
    await fetch('/api/packages/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter_mode: mode }),
    });
    setFilterMode(mode);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packages</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('blocklist')}
            className={`px-4 py-2 text-sm rounded-md ${
              filterMode === 'blocklist'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            Blocklist
          </button>
          <button
            onClick={() => handleModeChange('allowlist')}
            className={`px-4 py-2 text-sm rounded-md ${
              filterMode === 'allowlist'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            Allowlist
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filterMode === 'blocklist'
          ? 'Mode Blocklist: Semua notifikasi masuk, kecuali yang ditandai blocked.'
          : 'Mode Allowlist: Hanya notifikasi dari package yang ada di list (blocked=false) yang masuk.'}
      </p>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="com.example.app"
          value={newPackage}
          onChange={(e) => setNewPackage(e.target.value)}
          className="flex-1 px-4 py-2 bg-card border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add
        </button>
      </form>

      {packages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No packages yet
        </div>
      ) : (
        <div className="space-y-2">
          {packages.map((pkg) => (
            <div
              key={pkg.package_name}
              className="bg-card border rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono">{pkg.package_name}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(pkg.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleBlocked(pkg)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    pkg.blocked
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {pkg.blocked ? 'Blocked' : 'Allowed'}
                </button>
                <button
                  onClick={() => handleDelete(pkg.package_name)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
