# VCC Digital Twin — Scaffold

Real, runnable core of the Train → Car → System → Subsystem → Equipment →
Connector → Pin → Wire → Drawing hierarchy from the PRD, plus real auth,
RBAC enforcement, an evidence-grounded AI assistant, integrity validation,
search, CI, tests, and error/loading states.

This is a staged build against a 20-phase spec — not the full platform yet.
See "Deliberately not built" below. Each phase here is genuinely complete
and working, not a placeholder claiming to be done.

## What's here
- `prisma/schema.prisma` — full hierarchy + `ValidationStatus` enum + `User`/`Role` (RBAC)
- `prisma/seed.ts` — 1 admin user, 1 real fully-traced wire, 6 cars, 3 systems, 1 diagnostic, 1 VCC knowledge entry
- **Auth**: `/login`, `/api/auth/{login,logout,me}` — real bcrypt check, httpOnly session cookie
- **RBAC enforcement**: `middleware.ts` blocks all pages/APIs except `/login` and `/api/health` until signed in. `/api/wires/verify` is ADMIN-only — the one write path in the scaffold, deliberately narrow and gated, exercised from the Search page's "Mark verified" button
- **AI assistant**: `/assistant` + `/api/assistant` — retrieval-first: pulls matching diagnostics/wires/VCC knowledge from the DB, hands them to Claude as the only allowed evidence, requires citations and a confidence score, refuses to guess when nothing matches. Needs `ANTHROPIC_API_KEY`
- `app/api/{health,hierarchy,wires/trace,diagnostics,vcc}` — DB-backed, zero mock data
- `app/api/validate` — integrity engine (missing drawing refs, synthetic wires, conflicting wire numbers, empty connectors, broken drawing chains), logic unit-tested in `lib/validation/checks.test.ts`
- `app/api/search` — cross-entity search (wire/equipment/drawing/fault)
- `app/{twin,search,assistant,diagnostics,vcc-reference,validate}` — pages, all DB-backed
- `docker-compose.yml` — local Postgres
- `.github/workflows/ci.yml` — migrate, lint, unit tests, build against a real Postgres service container on every push

## Run it
```bash
docker compose up -d
npm install
cp .env.example .env.local     # fill DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```
Sign in at http://localhost:3000/login with `admin@beml.local` / `changeme123`, rotate immediately after.

On Vercel: env vars (`DATABASE_URL`, `DIRECT_URL`, `ANTHROPIC_API_KEY`) → deploy. Build runs `prisma generate && prisma migrate deploy && next build` automatically.

## Deliberately NOT built here
Electronics encyclopedia, multi-agent RAG beyond this single-turn assistant,
9-level GSD topology graph beyond the current hierarchy tree, commissioning/
maintenance workflow modules, drawing revision management UI, real signup/
password-reset flow (only login exists). These are real remaining phases —
build one, verify it deployed and correct against production, then start
the next.
