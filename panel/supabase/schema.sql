-- Supabase schema for NetConect Panel

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Devices table
create table devices (
  id uuid primary key default uuid_generate_v4(),
  device_id text unique not null,
  label text,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

-- Notifications table
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  device_id text references devices(device_id) on delete cascade,
  package_name text not null,
  title text,
  body text,
  posted_at timestamptz,
  received_at timestamptz default now(),
  raw jsonb
);

create index idx_notifications_device_id on notifications(device_id);
create index idx_notifications_package_name on notifications(package_name);
create index idx_notifications_received_at on notifications(received_at desc);

-- Packages table (for filtering)
create table packages (
  package_name text primary key,
  blocked boolean default false,
  note text,
  updated_at timestamptz default now()
);

-- Settings table
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Insert default filter mode
insert into settings (key, value) values ('filter_mode', '"blocklist"')
on conflict (key) do nothing;

-- Build jobs table
create table build_jobs (
  id uuid primary key default uuid_generate_v4(),
  app_name text not null,
  package_name text not null,
  status text not null check (status in ('queued', 'running', 'success', 'failed')) default 'queued',
  apk_url text,
  error_message text,
  github_run_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_build_jobs_status on build_jobs(status);
create index idx_build_jobs_created_at on build_jobs(created_at desc);

-- Enable Row Level Security
alter table devices enable row level security;
alter table notifications enable row level security;
alter table packages enable row level security;
alter table settings enable row level security;
alter table build_jobs enable row level security;

-- RLS policies (allow all for service role, restrict for anon)
-- Service role bypasses RLS, so API routes using service role will work
-- These policies are for any client-side access if needed

-- Devices: read for all authenticated
create policy "Devices are viewable by authenticated users" on devices
  for select using (auth.role() = 'authenticated');

-- Notifications: read for all authenticated
create policy "Notifications are viewable by authenticated users" on notifications
  for select using (auth.role() = 'authenticated');

-- Notifications: delete for authenticated
create policy "Authenticated users can delete notifications" on notifications
  for delete using (auth.role() = 'authenticated');

-- Packages: full access for authenticated
create policy "Authenticated users can manage packages" on packages
  for all using (auth.role() = 'authenticated');

-- Settings: read for all authenticated
create policy "Settings are viewable by authenticated users" on settings
  for select using (auth.role() = 'authenticated');

-- Build jobs: read for authenticated
create policy "Build jobs are viewable by authenticated users" on build_jobs
  for select using (auth.role() = 'authenticated');

-- Enable realtime for notifications
alter publication supabase_realtime add table notifications;

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_packages_updated_at
  before update on packages
  for each row execute function update_updated_at();

create trigger update_settings_updated_at
  before update on settings
  for each row execute function update_updated_at();

create trigger update_build_jobs_updated_at
  before update on build_jobs
  for each row execute function update_updated_at();
