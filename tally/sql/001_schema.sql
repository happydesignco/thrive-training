-- Tally schema. Apply this first, then 002_rls.sql.
-- Designed for Supabase Postgres. Uses auth.users (the Supabase Auth user table).

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid + digest

-- ============================================================
-- Families (tenant root) + family rules
-- ============================================================
create table if not exists families (
  id                              uuid primary key default gen_random_uuid(),
  name                            text not null,
  invite_code                     text not null unique,
  -- Rules. All editable per family by the parent.
  weekly_token_allowance          int  not null default 10,
  screen_time_minutes_per_token   int  not null default 30,
  cash_per_unspent_token_cents    int  not null default 50,
  reading_minutes_per_token       int  not null default 30,
  week_starts_on                  int  not null default 0  -- 0 = Sunday (Postgres dow convention)
                                       check (week_starts_on between 0 and 6),
  -- Marketplace participation: opt-in. If false, kids in this family can't send/receive cross-family.
  marketplace_enabled             boolean not null default true,
  created_at                      timestamptz not null default now()
);

-- Each parent user is a member of exactly one family in v1.
-- Modeling as a join table leaves room for more parents / co-guardians later without a migration.
create table if not exists family_members (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  family_id   uuid not null references families(id) on delete cascade,
  role        text not null default 'parent' check (role in ('parent')),
  created_at  timestamptz not null default now()
);
create index if not exists family_members_family_idx on family_members(family_id);

-- ============================================================
-- Kids
-- ============================================================
create table if not exists kids (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  name          text not null,
  -- SHA-256 of a 4-6 digit PIN. PIN itself never stored. UX-level gate, not a security boundary.
  pin_hash      text not null,
  avatar_color  text not null default '#facc15',
  birth_year    int,
  archived      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists kids_family_idx on kids(family_id);

-- ============================================================
-- Transactions = source of truth for balances.
-- Balance = sum(delta) over a kid's rows.
-- ============================================================
create table if not exists transactions (
  id                  uuid primary key default gen_random_uuid(),
  kid_id              uuid not null references kids(id) on delete cascade,
  delta               int  not null,
  kind                text not null check (kind in (
    'weekly_allowance',
    'reading_earned',
    'screen_time_spent',
    'manual_grant',
    'manual_deduct',
    'transfer_in',
    'transfer_out',
    'cashout'
  )),
  note                text,
  -- Cross-references for traceability
  related_transfer_id uuid,
  related_reading_id  uuid,
  week_anchor         date,  -- The Sunday (or week_starts_on day) of this transaction's week.
  created_by_user_id  uuid references auth.users(id),
  created_at          timestamptz not null default now()
);
create index if not exists transactions_kid_idx on transactions(kid_id, created_at desc);
create index if not exists transactions_week_idx on transactions(kid_id, week_anchor);

-- ============================================================
-- Reading log. Kid (or parent) logs minutes. Parent approves → tokens auto-issued.
-- ============================================================
create table if not exists reading_log (
  id              uuid primary key default gen_random_uuid(),
  kid_id          uuid not null references kids(id) on delete cascade,
  minutes         int  not null check (minutes > 0),
  book_title      text,
  logged_at       timestamptz not null default now(),
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  tokens_awarded  int,             -- computed at approval time using the family's rate
  approved_by     uuid references auth.users(id),
  approved_at     timestamptz
);
create index if not exists reading_log_kid_idx on reading_log(kid_id, logged_at desc);
create index if not exists reading_log_status_idx on reading_log(kid_id, status);

-- ============================================================
-- Cross-family transfers ("marketplace"). Both parents must approve.
-- ============================================================
create table if not exists transfers (
  id                          uuid primary key default gen_random_uuid(),
  from_kid_id                 uuid not null references kids(id) on delete cascade,
  to_kid_id                   uuid not null references kids(id) on delete cascade,
  -- Denormalized display fields so the other side can show context without RLS-violating cross-family reads.
  from_kid_name               text not null,
  to_kid_name                 text not null,
  from_family_name            text not null,
  to_family_name              text not null,
  amount                      int  not null check (amount > 0),
  note                        text,
  status                      text not null default 'pending'
                                check (status in ('pending', 'approved', 'rejected', 'canceled')),
  -- Each parent independently records their decision.
  sender_parent_decision      text check (sender_parent_decision in ('approved','rejected')),
  sender_parent_at            timestamptz,
  sender_parent_user_id       uuid references auth.users(id),
  recipient_parent_decision   text check (recipient_parent_decision in ('approved','rejected')),
  recipient_parent_at         timestamptz,
  recipient_parent_user_id    uuid references auth.users(id),
  initiated_by_user_id        uuid references auth.users(id),
  initiated_at                timestamptz not null default now(),
  completed_at                timestamptz,
  -- Same-family transfers don't need two approvals; just one.
  same_family                 boolean not null default false,
  check (from_kid_id <> to_kid_id)
);
create index if not exists transfers_from_idx on transfers(from_kid_id, status);
create index if not exists transfers_to_idx   on transfers(to_kid_id,   status);

-- ============================================================
-- Weekly cashout snapshots. One row per kid per week, created when the week closes.
-- ============================================================
create table if not exists weekly_cashouts (
  id                uuid primary key default gen_random_uuid(),
  kid_id            uuid not null references kids(id) on delete cascade,
  week_anchor       date not null,
  starting_tokens   int  not null default 0,
  earned_tokens     int  not null default 0,
  spent_tokens      int  not null default 0,
  transfer_in       int  not null default 0,
  transfer_out      int  not null default 0,
  remaining_tokens  int  not null default 0,
  cents_earned      int  not null default 0,
  closed_at         timestamptz not null default now(),
  closed_by_user_id uuid references auth.users(id),
  unique (kid_id, week_anchor)
);

-- ============================================================
-- Helper functions
-- ============================================================

-- Current user's family_id, or null. Used inside RLS policies.
create or replace function auth_family_id() returns uuid
  language sql stable security definer
  set search_path = public
as $$
  select family_id from family_members where user_id = auth.uid()
$$;

-- Generate a random invite code (e.g. "WHALE-7421"). Idempotent helper for app code.
create or replace function generate_invite_code() returns text
  language plpgsql
as $$
declare
  words text[] := array['WHALE','OTTER','BISON','HAWK','RAVEN','TIGER','LYNX','HERON','MOOSE','FOX','BEAR','OWL'];
  word text;
  num  int;
begin
  word := words[1 + floor(random() * array_length(words,1))::int];
  num  := 1000 + floor(random() * 9000)::int;
  return word || '-' || num::text;
end
$$;
