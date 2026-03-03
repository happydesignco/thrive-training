-- Create the workouts table
create table workouts (
  id              uuid default gen_random_uuid() primary key,
  legacy_id       text unique,
  name            text not null,
  title           text not null default '',
  category        text not null check (category in ('conditioning', 'metcon', 'accessory')),
  format          text,
  sections        jsonb not null default '{}',
  scaling         jsonb,
  excerpt         text,
  equipment       text[] default '{}',
  duration_minutes integer,
  intensity       text,
  notes           text,
  created_by      uuid references auth.users(id) on delete set null,
  is_public       boolean not null default false,
  is_seed         boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_workouts_category on workouts (category);

-- RLS
alter table workouts enable row level security;

-- Read: seed + public + own
create policy "visible workouts" on workouts for select using (
  is_seed = true or is_public = true or created_by = auth.uid()
);

-- Write: own non-seed only
create policy "create own" on workouts for insert with check (
  created_by = auth.uid() and is_seed = false
);
create policy "update own" on workouts for update using (
  created_by = auth.uid() and is_seed = false
);
create policy "delete own" on workouts for delete using (
  created_by = auth.uid() and is_seed = false
);
