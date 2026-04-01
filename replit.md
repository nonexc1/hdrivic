# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Authentication**: express-session + bcryptjs (session-based)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── hd-rivic/           # HD RIVIC GLOBAL frontend (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## HD RIVIC GLOBAL - Real Estate Platform

### Features
- Property catalog (houses, apartments, land, commercial)
- Search & filters: by district, status (venta/alquiler/airbnb), type, price range
- Featured properties on homepage hero
- WhatsApp contact button (floating + sticky on mobile)
- Lead capture forms (contact / agendar visita)
- Admin panel (requires approved account):
  - Upload/edit/delete properties
  - Mark as sold (vendido)
  - View all leads
  - Approve/reject pending user accounts (owner only)
- Session-based auth (express-session + bcryptjs)

### Admin Account
- Email: admin@hdrivic.com
- Password: HdRivic2024!
- Role: owner (full access)

### Database Tables
- `properties` — real estate listings
- `leads` — contact form submissions
- `users` — admin/owner accounts with session-based auth

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Packages

### `artifacts/hd-rivic` (`@workspace/hd-rivic`)

React + Vite SPA for HD RIVIC GLOBAL real estate website.
- Entry: `src/main.tsx`
- Pages: Home (`/`), Properties (`/propiedades`), Property Detail (`/propiedades/:id`), Login (`/login`), Admin (`/admin`)
- Depends on: `@workspace/api-client-react`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.
- Routes: `/api/properties`, `/api/leads`, `/api/users`, `/api/healthz`
- Sessions via `express-session` (SESSION_SECRET env var required)
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
