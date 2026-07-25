# Build Plan & Progress Tracker

> Single source of truth for build state. Updated at every checkpoint so progress
> survives across sessions. `[x]` done · `[~]` in progress · `[ ]` pending.

## Phase 0 — Monorepo Foundation
- [x] Tooling survey (node/pnpm/docker/postgres present)
- [x] Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- [x] Shared config: `tsconfig.base.json`, prettier, editorconfig, npmrc, gitignore
- [x] `.env.example` (all integrations documented)
- [x] `docker-compose.yml` (postgres, redis, mailhog, adminer)
- [x] `BUILD_PLAN.md`, `README.md`
- [x] GitHub Actions CI workflow
- [x] `git init` (on `main`; commits deferred until requested)

## Phase 1 — Shared Packages (contracts) ✅
- [x] `packages/config` — tsconfig presets, eslint config, design tokens, constants
- [x] `packages/db` — Prisma schema (40 models, full normalized model), client, seed
- [x] `packages/types` — enums, Zod schemas, DTOs (browser-safe, no Prisma dep)
- [x] Verified: `pnpm install`, `prisma generate`, `prisma validate`, `typecheck`, `lint` all green
- [~] Live migration + seed against Postgres (running in background pending Docker)

## Phase 2 — Backend (`apps/api`)
- [x] App bootstrap (Express, typed env, pino logging, error handling, response helpers, async handler) — **boots & verified via live HTTP**
- [x] Security layer (helmet, cors, rate-limit, hpp, compression, request-id, Zod validate middleware)
- [x] Auth module (register, login, refresh+rotation, logout, forgot/reset, change password, /me) — **verified end-to-end vs live DB (11/11 cases)**
- [x] RBAC middleware (authenticate, requireRoles, requirePermissions) — admin login returns 82 perms
- [x] Email integration (Nodemailer + mock fallback, branded templates) — welcome & reset
- [x] **Live DB up**: local Postgres 18, migrated (`init`) + seeded. Admin `admin@saudiluxurytravel.com` / `Admin@12345`
- [x] Packages module (CRUD: pagination, filters, nested writes, public+admin, soft delete) — **verified end-to-end (12/12 cases)**
- [x] Batch 1 fan-out (destinations, categories, tags, faq, testimonials) — **integrated + verified** (typecheck 4/4, lint 4/4, all endpoints live, RBAC 86 perms)
- [x] Batch 2 fan-out — PARTIAL: **users(admin) + notifications** salvaged + verified (no passwordHash leak; ownership scoping). **settings** hand-built + verified (public config map + admin CRUD). Other 3 agents (posts, reviews, hotels) hit the **session limit** mid-run; their partial files were removed.
- [x] Batch 2 COMPLETE: users(admin), notifications, settings, hotels(curated), reviews(+rating recompute), posts(blog+views) — all integrated + verified
- [ ] Batch 3: flights(curated), contact, newsletter, roles/permissions(admin), media(Cloudinary), activity-logs, analytics
- [x] **Bookings module** — create (pricing + VAT), atomic race-safe seat reservation, cancel (restores seats), admin status, ownership scoping — verified end-to-end (8/8)
- [x] **Payments module** — adapter pattern (Stripe SDK + HyperPay/PayTabs REST, env-gated; mock fallback), initiate/confirm/webhook/refund, booking auto-settle — verified end-to-end (7/7 mock lifecycle)
- [x] **Invoices module** — generate from booking (idempotent), branded **PDF via pdfkit** (verified real %PDF, 2.2KB), download + email, void, admin list — verified 6/6
- [x] **Visa module** — customer requests (auto reference), document attachments, admin status workflow + fee, ownership scoping — verified 6/6
- [x] **media** module (Cloudinary + local-disk fallback via multer, static serving) — verified upload/fetch/delete
- [x] **Batch 3 CRUD**: flights, contact, newsletter, roles/permissions(admin), activity-logs(+audit helper), analytics(dashboard) — all verified
- [ ] HotelBeds/Amadeus live-search adapters — DEFERRED (credential-gated, not CRUD; curated hotels/flights cover the site)

## ✅ BACKEND COMPLETE — 26 route groups, all verified end-to-end
- Note: live Stripe/HyperPay/PayTabs paths coded but need sandbox keys to verify; mock path fully verified.
- [ ] Media library (Cloudinary adapter)
- [ ] Notifications (in-app + email + WhatsApp)
- [ ] Website settings
- [ ] Analytics/reporting endpoints for admin dashboard
- [ ] Integrations: Email (Nodemailer), Maps, WhatsApp

## Phase 3 — Frontend Public Site (`apps/web`)
- [x] App scaffold (Next 15 App Router, Tailwind, shadcn, next-intl, TanStack Query providers) — typechecks clean
- [x] Design system: theme (light/dark CSS vars), tokens, typography (Inter/Tajawal), RTL — wired
- [x] Core layout: Header (nav + language/theme switchers + mobile menu), Footer (+ live newsletter form)
- [x] API client (`lib/api-client`) + **Home page LIVE** — hero, live featured packages from API, services, why-us, CTA
- [x] **Verified running in browser**: EN + AR/RTL, live DB data, Arabic titles + `Intl` currency (screenshot renderer flaky in this env; confirmed via page-text)
- [x] Reusable UI primitives (Card, Input, Badge, Skeleton) + PackageCard, PageHero, Breadcrumbs
- [x] **Packages listing** (filters + pagination) + **Package detail** (itinerary, inclusions, departures, reviews, booking sidebar, per-package SEO) — verified live
- [x] **All public pages built + verified** (hand-built after workflow hit subagent limit): hajj/umrah/domestic/international, hotels(list+detail), flights, visa, about, contact(+form), faq(+accordion), testimonials, blog(list+detail), privacy, terms, 404 — bilingual EN/AR, live API data, typecheck clean
- [x] **Booking checkout + Payment**: /packages/[slug]/book → /bookings/[id]/pay (initiate → mock confirm → success) — typecheck clean, API flow verified
- [x] **SEO**: robots.ts (blocks admin/dashboard), dynamic sitemap.ts (static + live package/hotel/blog URLs × locales), JSON-LD (TravelAgency in layout + TouristTrip in package detail), per-page OpenGraph/metadata — verified robots.txt + sitemap.xml serve
- [x] **Production build verified**: `next build` → 69 pages compiled + type-checked + prerendered (EN/AR), 103 kB shared JS

## Phase 4 — Customer Portal
- [x] Auth: AuthProvider + Login, Register, Forgot-password (cross-origin auth verified in browser); header reflects auth state
- [x] Dashboard (bookings list) — closes login→checkout loop
- [ ] Invoices (list + PDF download), Wishlist, Notifications, Profile, Settings

## Phase 5 — Admin Panel
- [x] Admin shell (guarded /admin layout, sidebar, RBAC role-gate, own chrome — public header/footer hidden on /admin) — verified
- [x] **Dashboard + Analytics** (live /analytics/dashboard: revenue, bookings, customers, packages, hotels, visa, messages + recent bookings) — verified in browser
- [x] Management tables (reusable AdminResourceTable + authFetch, paginated): Bookings, Packages, Hotels, Flights, Visa, Payments, Customers, Posts, Testimonials, FAQs, Settings — verified live (dashboard + customers)
- [ ] CRUD **edit** actions (create/edit/delete forms/modals — API supports full CRUD; UI currently list/view only)
- [ ] Media Library screen, Roles/Permissions editor, Activity Logs viewer

## Phase 6 — Cross-cutting
- [ ] i18n complete (en/ar translation files, RTL verified)
- [ ] Accessibility pass (WCAG AA)
- [ ] Performance (ISR/SSR, image optimisation, caching, code splitting)
- [ ] Validation everywhere (Zod on both sides)

## Phase 7 — Quality & Delivery
- [x] Dockerfiles (api multi-stage; web multi-stage w/ Next standalone) + `.dockerignore`
- [x] `docker-compose.prod.yml` (postgres + redis + api + web + nginx) + Nginx reverse proxy (`infra/nginx/nginx.conf`)
- [x] CI workflow present (`.github/workflows/ci.yml`: install → prisma generate → migrate → lint → typecheck → test → build)
- [x] **Final build verification**: web `next build` 69 pages green; full workspace typecheck 5/5 + lint 5/5
- [ ] Automated tests (Vitest/supertest backend, Testing Library/Playwright frontend) — scaffolding present, suites TBD
- Note: Docker images need a running Docker daemon to build (unavailable in this env); config follows standard multi-stage pnpm-monorepo patterns.

## Decisions Log
- Monorepo: **pnpm workspaces + Turborepo**. Package scope: `@travel/*`.
- Backend architecture: **Clean Architecture** — routes → controllers → services → repositories → Prisma.
- Shared validation: **Zod** schemas in `@travel/types`, reused by API (runtime) and web (forms).
- Integrations use the **Adapter pattern** with env-gated live/mock implementations.
- Currency default **SAR**; locales **en** (LTR/Inter) and **ar** (RTL/Tajawal).
