# Deployment Guide

This is a **two-app monorepo**: a Next.js frontend (`apps/web`) and an Express +
Prisma API (`apps/api`) backed by PostgreSQL. Vercel is perfect for the Next.js
app; the Express API + database need a home too. Two supported topologies:

- **Recommended:** Web on **Vercel** · API on a container host (**Railway / Render / Fly.io**) · **managed Postgres**. Robust, cheap, and uses the Dockerfiles already in the repo.
- **All-Vercel:** Web + API both on Vercel (API as serverless functions) · a **pooled** serverless Postgres (Neon / Vercel Postgres). Works, but Prisma-on-serverless needs connection pooling and cold-start care.

> ⚠️ You (the account owner) must run the deploy — it requires signing into your
> Vercel/host accounts and provisioning a database. The steps below are copy-paste.

---

## 0. Prerequisites

1. Push this repo to GitHub (not yet done):
   ```bash
   git add -A && git commit -m "Saudi Luxury Travel platform" && git branch -M main
   git remote add origin <your-repo-url> && git push -u origin main
   ```
2. A managed Postgres database. Good options:
   - **Neon** (serverless Postgres, has a pooled connection string) — ideal for Vercel.
   - **Supabase**, **Railway Postgres**, or **Vercel Postgres**.
   Grab its connection string → this becomes `DATABASE_URL`.
3. Generate strong secrets: `openssl rand -base64 48` (twice — access + refresh).

---

## 1. Deploy the API

### Option A (recommended) — Railway / Render / Fly.io

The repo already contains `apps/api/Dockerfile`. On any container host:

1. New service → “Deploy from repo” → root `/`, Dockerfile `apps/api/Dockerfile`.
2. Set environment variables (see **§3**). At minimum: `DATABASE_URL`,
   `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `WEB_APP_URL`, `API_PUBLIC_URL`.
3. The container's start command runs `prisma migrate deploy` then boots the API,
   so the schema is applied automatically on first deploy.
4. Note the public URL, e.g. `https://api.yourdomain.com`.

Alternatively, without Docker: build with `pnpm --filter @travel/api build` and run
`node apps/api/dist/server.js` (after `pnpm --filter @travel/db migrate:deploy`).

### Option B — API on Vercel (serverless)

`apps/api/api/index.ts` + `apps/api/vercel.json` expose the Express app as a
function. Create a **second** Vercel project with **Root Directory = `apps/api`**.
Caveats:
- Use a **pooled** `DATABASE_URL` (Neon pooler / `?pgbouncer=true`) — serverless
  opens many short-lived connections.
- Run migrations out-of-band once: `pnpm --filter @travel/db migrate:deploy`
  (locally, pointed at the prod DB) — Vercel build doesn't migrate.
- Prisma engine target `rhel-openssl-3.0.x` is already in the schema.

---

## 2. Deploy the Web app to Vercel

1. Vercel → **New Project** → import the GitHub repo.
2. **Root Directory:** `apps/web` (Vercel auto-detects Next.js + the pnpm workspace).
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://<your-api-host>/api/v1`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-web-domain>`
4. Deploy. Vercel installs at the repo root and builds `apps/web`
   (`transpilePackages` handles the shared workspace packages).
5. After the API is live, set the API's `CORS_ORIGINS` and `WEB_APP_URL` to the
   web domain and redeploy the API.

> The build was verified locally: `next build` compiles **69 pages** cleanly.
> Vercel builds natively (no `output: standalone` needed there).

---

## 3. Environment variables

Copy from `.env.example`. Required in production:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Managed Postgres (pooled if serverless) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | ≥ 32 random chars each |
| `CORS_ORIGINS` | The web domain(s), comma-separated |
| `WEB_APP_URL`, `API_PUBLIC_URL` | Public URLs (used in emails, redirects, webhooks) |
| `COOKIE_SECURE=true`, `COOKIE_DOMAIN` | Production cookies over HTTPS |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` | Web build-time (Vercel) |

**Optional integrations** (activate live behaviour; otherwise a safe mock is used):
Stripe / HyperPay / PayTabs, HotelBeds, Amadeus, Cloudinary, Google Maps, SMTP,
WhatsApp — see `.env.example` for the full list and add real sandbox/live keys.

---

## 4. Post-deploy checklist

- [ ] `DATABASE_URL` reachable; `prisma migrate deploy` ran (tables exist).
- [ ] Seed once for the super-admin + RBAC: `pnpm --filter @travel/db seed` (against prod DB).
- [ ] `GET https://<api>/api/v1/health` → `{ "success": true }`.
- [ ] Web loads; sign in with the seeded admin; `/en/admin` reachable.
- [ ] Payment/hotel/flight webhooks point at `https://<api>/api/v1/payments/webhook/<provider>`.
- [ ] Rotate the seeded admin password.

---

## 5. Full-stack Docker (single host)

To run the entire stack (postgres + redis + api + web + nginx) on one VM:

```bash
cp .env.example .env   # fill production values
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Nginx serves the site on port 80: `/` → web, `/api` + `/uploads` → API.
