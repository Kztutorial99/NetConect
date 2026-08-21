'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

type BuildJob = {
  id: string;
  app_name: string;
  package_name: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  apk_url: string | null;
  error_message: string | null;
  github_run_id: string | null;
  created_at: string;
  updated_at: string;
};

const statusColors: Record<string, string> = {
  queued: 'bg-yellow-500',
  running: 'bg-blue-500',
  success: 'bg-green-500',
  failed: 'bg-destructive',
};

export default function BuildsPage() {
  const [jobs, setJobs] = useState<BuildJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/builds');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    // Poll for updates
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBuilding(true);

    try {
      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_name: appName, package_name: packageName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Build failed to start');
      } else {
        setAppName('');
        setPackageName('');
        fetchJobs();
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setBuilding(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Build APK</h1>

      {/* Build Form */}
      <form onSubmit={handleBuild} className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-medium">New Build</h2>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="My NetCon"
              className="w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Package Name</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="com.example.netcon"
              className="w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={building}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {building ? 'Building...' : 'Build APK'}
        </button>
      </form>

      {/* Build History */}
      <div className="space-y-4">
        <h2 className="font-medium">Build History</h2>

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
            No builds yet
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{job.app_name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs text-white rounded ${statusColors[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {job.package_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(job.created_at)}
                  </p>
                  {job.error_message && (
                    <p className="text-xs text-destructive mt-1">
                      {job.error_message}
                    </p>
                  )}
                </div>

                {job.status === 'success' && job.apk_url && (
                  <a
                    href={job.apk_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                  >
                    Download APK
                  </a>
                )}

                {(job.status === 'queued' || job.status === 'running') && (
                  <div className="animate-pulse text-muted-foreground text-sm">
                    Processing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
