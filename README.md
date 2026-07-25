# Saudi Luxury Travel

A production-grade, luxury travel agency platform for Saudi Arabia — Hajj & Umrah
packages, domestic & international tours, hotel & flight booking, visa services,
corporate travel and transportation. Bilingual (English / العربية) with full RTL,
dark mode, and WCAG AA accessibility.

## Tech Stack

| Layer      | Technology                                                                       |
| ---------- | -------------------------------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, React Hook Form, Zod, TanStack Query, next-intl |
| Backend    | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis                      |
| Auth       | JWT access/refresh tokens, RBAC, secure http-only cookies                        |
| Payments   | Stripe, HyperPay, PayTabs (adapter pattern, webhook handling, refunds)           |
| Travel API | HotelBeds (hotels), Amadeus (flights)                                            |
| Media      | Cloudinary                                                                        |
| Email      | Nodemailer (Mailhog in dev)                                                       |
| Infra      | Docker, Docker Compose, Nginx, GitHub Actions                                    |

## Monorepo Layout

```
apps/
  web/    Next.js 15 frontend (public site · customer portal · admin panel)
  api/    Express REST API (clean architecture)
packages/
  db/     Prisma schema, client, migrations, seed
  types/  Shared DTOs, enums, Zod validation schemas
  config/ Shared tsconfig, eslint, tailwind preset, design tokens, constants
infra/    Nginx config, Dockerfiles
```

## Prerequisites

- Node.js >= 20 (repo pinned to 24 via `.nvmrc`)
- pnpm >= 9
- Docker + Docker Compose

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env        # then edit as needed

# 3. Start local infrastructure (Postgres, Redis, Mailhog, Adminer)
pnpm docker:up

# 4. Generate the Prisma client, run migrations, seed data
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Run everything in dev
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- Mailhog UI: http://localhost:8025
- Adminer (DB UI): http://localhost:8080

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Run all apps in watch mode               |
| `pnpm build`        | Build all packages and apps              |
| `pnpm lint`         | Lint the whole workspace                 |
| `pnpm typecheck`    | Type-check every package                 |
| `pnpm test`         | Run the test suites                      |
| `pnpm db:migrate`   | Apply Prisma migrations (dev)            |
| `pnpm db:seed`      | Seed the database                        |
| `pnpm db:studio`    | Open Prisma Studio                       |

## Third-party credentials

Every external integration is optional in development — without keys, each provider
falls back to a deterministic local mock so the app runs end-to-end. Add real keys
to `.env` to switch a provider to live mode. See `.env.example` for the full list.

## Project status

See [`BUILD_PLAN.md`](./BUILD_PLAN.md) for the phase-by-phase build tracker.
