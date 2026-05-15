# NEXUS SSO

Standalone authentication service for all BioLoop apps.

## How it works

1. Any BioLoop app that needs auth redirects the user here with `?redirect_to=<return-url>`
2. User signs in (password or magic link)
3. NEXUS SSO redirects them back to `redirect_to` — Supabase JWT is stored in localStorage and shared across same-origin apps, or carried via the session cookie

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Login page |
| `/logout` | Signs out and redirects to `redirect_to` or `VITE_DEFAULT_APP_URL` |

## Env vars (Railway)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEFAULT_APP_URL=https://your-holdings-portal.up.railway.app
```

## Deploy

Standard Vite static build:
```
npm run build
```
Serve the `dist/` folder. Railway: set `npm run build` as build command, serve `dist/` statically.

## Wiring other apps

Set `VITE_NEXUS_AUTH_URL=https://your-nexus-sso.up.railway.app` on every BioLoop app that needs SSO. The app's `AuthContext` will redirect unauthenticated users here automatically.
