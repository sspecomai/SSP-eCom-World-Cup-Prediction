# Supersports Thailand eCom - World Cup 2026 Prediction

Production-style Next.js 14 App Router project for a World Cup 2026 prediction campaign using Supabase auth, RBAC, RLS, scoring logic, and leaderboard computation.

## Architecture (brief)

- **Frontend (Next.js App Router + Tailwind):** mobile-first sporty UI, reusable cards, countdown components, and admin/user pages.
- **API/Server Layer:** Next API routes and service modules for scoring and validation.
- **Data Layer (Supabase/Postgres):** normalized schema with `users`, `roles`, pre-questions, matches, scoring rules, prediction/answer submissions, and `leaderboard_summary` view.
- **Security:** Supabase Auth + role lookup + RLS policies and admin-only management policies.
- **Scoring:** deterministic TypeScript scoring utility (`OUTCOME`, `EXACT`, fallback outcome points, positive/negative scores), plus SQL-ready fields.

## Implemented pages

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/leaderboard`
- `/predictions`
- `/pre-questions`
- `/admin`
- `/admin/pre-questions`
- `/admin/matches`
- `/admin/results`
- `/admin/users`

## Project structure

```bash
app/
  admin/**
  api/**
  dashboard/
  leaderboard/
  login/
  predictions/
  pre-questions/
  register/
components/
  forms/
  leaderboard/
  layout/
  predictions/
  ui/
lib/
  services/
  supabase/
  utils/
  validators/
supabase/
  schema.sql
  seed.sql
tests/
```

## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment
   ```bash
   cp .env.example .env.local
   ```
3. Run locally
   ```bash
   npm run dev
   ```
4. Apply SQL in Supabase SQL editor:
   - `supabase/schema.sql`
   - `supabase/seed.sql`

## Local commands

```bash
npm run dev
npm run typecheck
npm run test
npm run lint
npm run build
```

## Assumptions

1. World Cup 2026 fixture data is placeholder until official final schedule is confirmed.
2. Admin users are provisioned through Supabase Auth and linked to `users` + `roles` rows.
3. Social login is represented as a placeholder field in this iteration.
4. Leaderboard tie-break uses `exact_result_points`, then `win_draw_lose_points`, then earliest submission.
5. Thailand timezone handling is represented by storing `timestamptz` and formatting with `Asia/Bangkok` in UI.

## Deployment recommendations

1. Deploy on Vercel with environment variables set for Supabase.
2. Run `schema.sql` and `seed.sql` in production Supabase project (separate seed subset for prod).
3. Add scheduled worker/edge function to auto-lock predictions at close time and compute scores if not using triggers.
4. Add audit triggers for `updated_at` + immutable score history table before launch.
5. Add E2E tests (Playwright) for register/login, submit once rules, and admin publish flows.
