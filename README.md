# Supersports Thailand × World Cup 2026 Prediction Game

A production-ready, full-stack prediction platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Architecture Overview

```
SSP-eCom-World-Cup-Prediction/
├── app/
│   ├── actions/          # Server Actions (auth, predictions, admin CRUD)
│   ├── admin/            # Admin-only pages (layout guards role)
│   ├── dashboard/        # User dashboard
│   ├── leaderboard/      # Live leaderboard
│   ├── login/            # Auth pages
│   ├── matches/          # Match prediction cards
│   ├── pre-questions/    # Pre-tournament question cards
│   ├── profile/          # Profile editor
│   ├── register/
│   ├── layout.tsx        # Root layout (injects auth state)
│   └── page.tsx          # Hero homepage
├── components/
│   ├── admin/            # Admin forms (MatchForm, PreQuestionForm, ResultForm)
│   ├── forms/            # AuthForm, ProfileForm
│   ├── layout/           # SiteShell (nav + footer)
│   ├── leaderboard/      # LeaderboardTable
│   ├── predictions/      # MatchCard, PreQuestionCard
│   └── ui/               # Countdown, Skeleton, StageBadge
├── lib/
│   ├── services/         # scoring.ts, nickname.ts, leaderboard.ts
│   ├── supabase/         # client.ts (SSR browser), server.ts (SSR server)
│   ├── types.ts          # All TypeScript types
│   ├── utils/            # cn.ts, time.ts
│   └── validators/       # Zod schemas
├── supabase/
│   ├── schema.sql        # Complete DB schema with RLS
│   └── seed.sql          # Scoring rules, pre-questions, WC2026 matches
├── middleware.ts          # Session refresh + route protection
└── tests/
    └── scoring.test.ts   # Unit tests for scoring utils
```

### Key design choices

| Concern | Approach |
|---|---|
| Auth | Supabase Auth with `@supabase/ssr` cookie-based sessions |
| Route protection | `middleware.ts` (unauthenticated) + admin `layout.tsx` (role check) |
| Data fetching | Server Components + `createClient()` from `lib/supabase/server.ts` |
| Mutations | Server Actions with `useFormState` + `useFormStatus` |
| Scoring | Calculated server-side on result publish; stored in DB for leaderboard reads |
| Leaderboard | Supabase view (`leaderboard_summary`) + client-side tie-break sort |

---

## Roles

| Role | Access |
|---|---|
| `user` | Register, answer questions, submit predictions, view leaderboard |
| `admin` | Everything above + manage matches/questions, publish results, manage users |

---

## Scoring System

### Match Predictions

**Exact Score Mode (`EXACT`)**
- Exact home & away score → **+8 pts**
- Correct outcome (H/D/A) but wrong score → **+3 pts** (fallback)
- Wrong outcome → **−2 pts**

**Outcome Mode (`OUTCOME`)**
- Correct win / draw / lose → **+4 pts**
- Wrong outcome → **−1 pt**

### Pre-Questions
- Correct answer → **+10 pts**
- Wrong answer → **−3 pts**

### Tie-break Order
1. Most exact-result points
2. Most win/draw/lose outcome points
3. Earliest first submission timestamp

---

## Database Setup (Supabase)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the schema

In the **SQL Editor**, paste and run `supabase/schema.sql`.

### 3. Run the seed data

In the **SQL Editor**, paste and run `supabase/seed.sql`.

### 4. Promote the first admin user

After registering your account in the app, run this in the SQL editor:

```sql
-- Replace with the UUID from Supabase Auth dashboard → Users
update public.users
set role_id = (select id from public.roles where role = 'admin')
where id = 'YOUR_USER_UUID_HERE';
```

### 5. (Optional) Disable email confirmation for local dev

Supabase Dashboard → **Authentication → Providers → Email** → disable "Confirm email".

---

## Connecting Supabase

1. In your Supabase project, go to **Settings → API**.
2. Copy the **Project URL** and **anon public** key.
3. Copy the `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # from Settings > API > service_role
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Supabase project (with schema + seed applied)

```bash
# Install dependencies (includes @supabase/ssr)
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Run unit tests
npm test

# Type-check
npm run typecheck

# Lint
npm run lint
```

---

## Deploying on Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repository.
3. Add these **Environment Variables** in Vercel project settings:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service-role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

4. Click **Deploy**.
5. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to **Redirect URLs** (e.g. `https://your-app.vercel.app/**`).

---

## Pages Reference

| Route | Description |
|---|---|
| `/` | Hero landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | User stats, recent predictions + answers |
| `/matches` | Match cards with prediction forms (grouped by stage) |
| `/pre-questions` | Pre-tournament question cards with answer forms |
| `/leaderboard` | Live ranked leaderboard with podium |
| `/profile` | Edit display name, nickname, favourite team, alias |
| `/admin` | Admin dashboard with key stats |
| `/admin/matches` | Create / view / delete matches |
| `/admin/pre-questions` | Create / view / delete pre-questions |
| `/admin/results` | Publish final scores and correct answers |
| `/admin/users` | View users, promote/demote admin role |

---

## Environment Variables Reference

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Public — safe in browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Public — RLS protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-only — never expose to browser |
| `NEXT_PUBLIC_APP_URL` | Optional | Used by `next.config.ts` for allowed origins |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| SSR Sessions | `@supabase/ssr` |
| Validation | Zod |
| Icons | Lucide React |
| Testing | Vitest |
| Deployment | Vercel |

---

## Notes

- World Cup 2026 fixtures use realistic placeholder dates. Update with official schedule when announced.
- Thailand (GMT+7) times are stored as `timestamptz` in UTC and formatted with `Asia/Bangkok` timezone in the UI.
- The `handle_new_user` trigger auto-creates a profile row on Supabase Auth signup.
- Leaderboard is a Supabase view; production scale may benefit from a materialized view + periodic refresh.
