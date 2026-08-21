# NetConect

Notification management panel + custom APK builder.

## Architecture

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────┐
│  Android APK    │────▶│  Panel (Next.js)   │────▶│ Supabase │
│  NotifListener  │     │  /api/ingest       │     │  (DB)    │
│                 │◀────│  /api/config       │     └──────────┘
└─────────────────┘     └────────────────────┘
                                   │
                                   ▼
                        GitHub Actions (build APK)
```

## Repo Structure

```
/               → Android app (NotificationListener, forwards all to panel)
/panel          → Next.js web panel (deploy to Vercel)
/.github        → GitHub Actions workflow for custom APK builds
```

## Setup

### 1. Supabase
- Create a Supabase project
- Run `panel/supabase/schema.sql` in the SQL editor
- Copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### 2. Panel (Vercel)
- Import this repo in Vercel
- Set root directory to `panel`
- Add env vars (see `panel/.env.example`)
- Deploy

### 3. GitHub Secrets
Add to repo settings → Secrets → Actions:
- `PANEL_URL` → your Vercel URL
- `PANEL_CALLBACK_SECRET` → random secret (same as in Vercel env)

### 4. Build APK
1. Open panel → Builds page
2. Fill App Name + Package Name
3. Click Build → GitHub Actions runs → APK ready for download

## Environment Variables

See `panel/.env.example` for all required vars.

## Tech Stack
- **Panel**: Next.js 14, Tailwind, NextAuth, Supabase
- **Android**: Kotlin, NotificationListenerService
- **CI/CD**: GitHub Actions
