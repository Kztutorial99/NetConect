import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Device = {
  id: string;
  device_id: string;
  label: string | null;
  last_seen: string;
  created_at: string;
};

export type Notification = {
  id: string;
  device_id: string;
  package_name: string;
  title: string | null;
  body: string | null;
  posted_at: string | null;
  received_at: string;
  raw: Record<string, unknown> | null;
};

export type Package = {
  package_name: string;
  blocked: boolean;
  note: string | null;
  updated_at: string;
};

export type BuildJob = {
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

export type FilterMode = 'blocklist' | 'allowlist';
