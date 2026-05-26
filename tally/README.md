# Tally

A family token economy. Kids earn tokens (reading, chores), spend them (screen time),
save them for weekly cash payouts, and — opt-in — trade them with kids in other families.

- **Auth**: One parent account per family (Supabase Auth)
- **Kid mode**: Kids unlock their own view with a short PIN on a shared device
- **Marketplace**: Cross-family token transfers, approved by both parents
- **Configurable**: Each family sets its own allowance, screen-time rate, cash rate, reading rate

Stack: Vite + React + React Router · Supabase Postgres (RLS-secured) · Tailwind v4 · designed to deploy on Sevalla.

---

## Quick start (local dev)

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:5173.

---

## Supabase setup

1. **Create a Supabase project** at https://supabase.com/dashboard. Pick a region near you.
2. In the project, open **SQL Editor** and run, in this order:
   - `sql/001_schema.sql`
   - `sql/002_rls.sql`
   - `sql/003_rpcs.sql`
   - `sql/004_leaderboard.sql`
3. Open **Authentication → Providers → Email**:
   - For dev, you can disable "Confirm email" so signups go straight through.
   - For production, keep confirmation on and configure your SMTP.
4. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / publishable key** → `VITE_SUPABASE_ANON_KEY`
5. Add those to your local `.env` for dev, and to Sevalla's env vars for production (see below).

### What the SQL does

- `001_schema.sql` — Tables: `families`, `family_members`, `kids`, `transactions` (the ledger),
  `reading_log`, `transfers`, `weekly_cashouts`. Balances are always `SUM(delta)` over a kid's transactions.
- `002_rls.sql` — Row-Level Security so each family only sees its own data. The one exception is
  `transfers`, which is visible to whichever family is on either side of the pending row.
- `003_rpcs.sql` — Stored procedures for the things clients shouldn't do directly:
  `create_family`, `lookup_family_by_invite`, `approve_transfer` / `reject_transfer`,
  `approve_reading` / `reject_reading`, `start_week`, `close_week`.
- `004_leaderboard.sql` — Adds `neighborhoods` + `neighborhood_members`, kid `handle` +
  `leaderboard_opt_in` columns, and `get_neighborhood_leaderboard` — a SECURITY DEFINER
  RPC that returns ONLY `{handle, avatar_color, balance, reading_minutes_this_week, is_mine}`,
  never names or kid IDs.

---

## Deploying to Sevalla

Sevalla auto-deploys from GitHub on push. There are two ways to ship a Vite app; both work.

### Option A — Deploy as a static site (recommended)

In the Sevalla dashboard, when creating the application:

- **Type**: Static Site
- **Build command**: `npm ci && npm run build`
- **Publish directory**: `dist`
- **SPA routing**: enable the "single-page app" fallback that rewrites `/*` to `/index.html`.
  (If Sevalla's static site type doesn't have that toggle, use Option B instead.)
- **Environment variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Option B — Deploy as a Node app

- **Type**: Application
- **Build command**: `npm ci && npm run build`
- **Start command**: `npm start` (runs `vite preview --host --port $PORT`)
- **Port**: `4173` (or let `$PORT` decide)
- Env vars: same as above.

`vite preview` serves `dist/` and falls through to `index.html` for unknown paths, so SPA routing works without extra config.

### Supabase Auth redirect URLs

When your site is live, add the production URL to **Supabase → Authentication → URL Configuration → Site URL** and **Additional Redirect URLs**. Otherwise email confirmation links will redirect to localhost.

---

## Extracting this app into its own repo

Right now this app lives in `tally/` inside the `thrive-training` repo because that's where Claude was opened. To split it out:

```bash
# from anywhere
cp -r /path/to/thrive-training/tally ~/tally
cd ~/tally
rm -rf node_modules dist
git init
git add .
git commit -m "Initial commit: Tally"
gh repo create tally --private --source=. --push
# then connect that GitHub repo to Sevalla
```

---

## How a week works

1. **Sunday**: Parent taps `+ Week` on each kid (or per kid on demand). Each kid gets the configured weekly allowance.
2. **During the week**: Kids earn extra tokens by logging reading (parent approves), and spend tokens on screen time. Parents can grant/deduct manually (`±` button) for chores or infractions.
3. **End of week**: Parent goes to **History → Cash out last week** for each kid. Unspent tokens convert to cents at the family's configured rate. The cashout zeros remaining tokens, then next week's `+ Week` issues a fresh allowance.

## How the leaderboard works

1. A family creates a **neighborhood** (e.g. "Oak Street") and shares the code, or joins via someone else's code. A family can be in any number of neighborhoods.
2. Each kid optionally picks an **anonymous handle** (parent sets/approves it in the Kids tab) and toggles **Show on neighborhood leaderboards**.
3. The **Board** tab shows each joined neighborhood with two rankings:
   - **Top Savers** — current token balance
   - **Top Readers this week** — approved reading minutes since the week started
4. Cross-family rows are pulled via a single SECURITY DEFINER RPC that returns only `{handle, avatar_color, balance, reading_minutes_this_week, is_mine}` — never real names, kid IDs, or family info. The kid's own family sees `is_mine = true` so the UI can highlight their entries.

## How marketplace transfers work

1. A kid taps **Send tokens → Other family**, enters the recipient family's invite code, picks the kid.
2. Both parents approve from their **Inbox**. On the second approval, two transactions post atomically: `transfer_out` on the sender, `transfer_in` on the recipient.
3. Tokens are 1:1 — the recipient's family's own cash rate applies to whatever they don't spend.
4. A family can disable the marketplace in **Rules**, which hides their kids from invite-code lookups.

## How kid PINs work

Kid PINs are a UX gate, not a security boundary. They're hashed (SHA-256) so a peeking sibling can't read another kid's PIN out of the DB row. The auth session is still the parent's, so the database doesn't grant the kid any privileges the parent didn't already have.

---

## Roadmap (ideas we explicitly skipped in v1)

- The Adventure goal-setting (areas like cooking, instrument, reading targets) as a layer above tokens
- Realtime sync (`supabase.channel(...)`) so parent and kid devices update each other live
- Push notifications when a transfer arrives or reading is approved
- A "shop" parents can stock with custom rewards (movie night, ice cream)
- Streaks and badges
