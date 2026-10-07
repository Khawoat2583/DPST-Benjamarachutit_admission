# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## CodeGraph Code Intelligence

This project is pre-indexed with **CodeGraph** under `.codegraph/` to enable extremely fast, token-efficient code navigation.
- Before searching the codebase manually with high-overhead `grep` or `find`/`glob`, query CodeGraph using your configured MCP tool or run `npx codegraph query "<search_term>"` / `npx codegraph context "<task_description>"`.
- This provides instant symbol resolutions and traces reference chains with minimal token usage.

## Project

DPST Admission Web — Next.js 16 (App Router, React 19) admission system for the พสวท. high-school program at Benchamarachuthit School. UI strings are Thai; code/comments are mixed Thai/English. PostgreSQL + Drizzle ORM, Zod validation, Tailwind v4 + shadcn/ui, ExcelJS for score import/export. See `README.md` for the Thai-language overview.

## Commands

```bash
npm run dev              # next dev
npm run build            # next build
npm run lint             # eslint (flat config in eslint.config.mjs)
npm run test             # vitest watch
npm run test:run         # vitest single run
npx vitest run path/to/file.test.ts   # run a single unit test file
npm run test:e2e         # playwright (config: playwright.config.ts)
npx playwright test path/to/spec.ts   # run a single e2e spec
npm run db:generate      # drizzle-kit generate (after schema changes)
npm run db:migrate       # drizzle-kit migrate (apply migrations)
docker-compose up -d     # local Postgres
npm run codegraph:status # show CodeGraph index health and stats
npm run codegraph:index  # rebuild/refresh the knowledge graph
npx codegraph query "<q>"# search symbols in knowledge graph
npx codegraph context "<t>"# retrieve task context from graph index
```

`npm run db:migrate` uses `MIGRATION_DATABASE_URL` (DDL-capable role) per `drizzle.config.ts`; the runtime app connects via `DATABASE_URL` (DML-only role). Both must be set in `.env`.

## Architecture

### Two separate auth realms
- **Applicant session** (`src/server/auth/session.ts`): cookie `dpst_session`, 24h, AES-256-GCM encrypted using `SESSION_SECRET`. Identifies a draft/submitted application by national ID across the multi-step apply flow.
- **Admin session** (`src/server/auth/admin-session.ts`): cookie `dpst_admin_session`, 2h (PDPA), same encryption scheme. Credentials come from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars (single-admin model, not a users table).

Both helpers must run server-side only (`next/headers` cookies). New auth-protected actions/pages should reuse these — do not roll a new cookie scheme.

### Feature-sliced server actions
Business logic lives under `src/features/<slice>/` and is invoked from the App Router via `"use server"` actions, not REST handlers. Slices:
- `applicant/` — apply flow, status page, GPA validation, course-code rules, school list. Pure logic (`grades.ts`, `validation.ts`, `course-code.ts`, `ranking.ts`) is unit-tested with Vitest; `actions.ts` are the server entry points.
- `admin-review/` — staff review/approve/reject + verification toggles for submitted applications.
- `exam-import/` — first-round exam score Excel ingestion.
- `ranking/` — final ranking computation. The tie-breaker hierarchy in `ranking/ranking.ts` (`compareApplicants`) is load-bearing: 9 ordered criteria from total exam score down to announcement list order. Do not reorder without confirming with the user.

`src/app/api/upload/` is the only REST endpoint (multipart file upload to `UPLOAD_ROOT`); everything else is server actions.

### Application state machine
`applicationStatus` enum in `src/db/schema.ts`: `draft → submitted → approved | rejected → ranked → exported`. `rejected` returns the applicant to edit mode (`rejectionReason` set). Workflow timestamps (`submittedAt`, `reviewedAt`, `rankedAt`, `exportedAt`) are written as the status advances — keep them in sync when adding new transitions.

Stage gating is centralized in `src/lib/system-settings.ts` (single-row settings table); features check the current stage there rather than hard-coding dates.

### Money/grade precision
GPAs are stored as Postgres `numeric(4,2)` and serialized as strings by `postgres-js`. Server actions convert to `number` only at the boundary (see `mapApplicationForClient` in `applicant/actions.ts`). When reading numeric columns, expect strings; never `Number()` raw DB rows without explicit parsing. Rounding uses `roundHalfUpToTwoDecimals` in `ranking/grades.ts` — reuse it for any new GPA math.

### Admin dashboard layout
`src/app/admin/(dashboard)/` is a route group with a shared sidebar layout (`admin-sidebar.tsx`, `layout.tsx`). Admin pages: `import/` (Excel exam scores), `review/[id]/` (per-application review), `workflow/` (stage controls). Login lives outside the group at `src/app/admin/login/`.

### Styling
Default to shadcn/ui components in `src/components/ui/` + Tailwind utility classes. CSS Modules (`*.module.css`) are reserved for special layouts that don't fit utilities — `src/lib/style-modules.ts` is the helper. `components.json` configures shadcn — use `npx shadcn@latest add <component>` to add new primitives.

### Next.js version warning
This repo runs Next.js **16.2.6** with React **19.2.4**. APIs (especially around `cookies()`, route handlers, server actions, caching) differ from older Next.js. Before writing non-trivial framework code, consult `node_modules/next/dist/docs/` rather than relying on training-data patterns. This is enforced by `AGENTS.md`.

## Testing layout

- Unit tests are colocated next to source (`*.test.ts` beside `*.ts`) and run via Vitest (`vitest.config.ts`).
- E2E specs live under `src/tests/` and run via Playwright. Fixtures (sample Excel files, etc.) are in `fixtures/`.
- Pure logic (grades, ranking, validation, course-code) is the primary unit-test target — server actions are exercised through E2E.
