-- Tally leaderboard: neighborhoods, handles, anonymized cross-family ranking.
-- Run AFTER 003_rpcs.sql.

-- ============================================================
-- Schema additions
-- ============================================================
alter table kids add column if not exists handle text;
alter table kids add column if not exists leaderboard_opt_in boolean not null default false;
create unique index if not exists kids_handle_unique on kids (lower(handle)) where handle is not null;

-- Neighborhoods are explicit groupings (e.g. "Oak Street", "Cousins").
-- Families opt in by joining via a shared code.
create table if not exists neighborhoods (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  join_code             text not null unique,
  created_by_family_id  uuid references families(id) on delete set null,
  created_at            timestamptz not null default now()
);

create table if not exists neighborhood_members (
  neighborhood_id  uuid not null references neighborhoods(id) on delete cascade,
  family_id        uuid not null references families(id) on delete cascade,
  joined_at        timestamptz not null default now(),
  primary key (neighborhood_id, family_id)
);
create index if not exists neighborhood_members_family_idx on neighborhood_members(family_id);

-- ============================================================
-- RLS
-- ============================================================
alter table neighborhoods enable row level security;
alter table neighborhood_members enable row level security;

-- A family can read a neighborhood if it's a member. Lookup-by-code happens through an RPC.
drop policy if exists neighborhoods_select_member on neighborhoods;
create policy neighborhoods_select_member on neighborhoods
  for select using (
    exists (select 1 from neighborhood_members nm
            where nm.neighborhood_id = neighborhoods.id
              and nm.family_id = auth_family_id())
  );

-- A family can update neighborhoods they created (e.g. rename).
drop policy if exists neighborhoods_update_creator on neighborhoods;
create policy neighborhoods_update_creator on neighborhoods
  for update using (created_by_family_id = auth_family_id())
  with check (created_by_family_id = auth_family_id());

-- All membership management is via RPC; clients see only their own family's memberships.
drop policy if exists neighborhood_members_select_own on neighborhood_members;
create policy neighborhood_members_select_own on neighborhood_members
  for select using (family_id = auth_family_id());

drop policy if exists neighborhood_members_delete_own on neighborhood_members;
create policy neighborhood_members_delete_own on neighborhood_members
  for delete using (family_id = auth_family_id());

-- ============================================================
-- RPCs
-- ============================================================

-- Create a neighborhood. The creating family is auto-joined.
create or replace function create_neighborhood(p_name text)
returns neighborhoods
language plpgsql
security definer
set search_path = public
as $$
declare
  fam uuid := auth_family_id();
  n   neighborhoods;
  attempt int := 0;
  words text[] := array['OAK','PINE','ELM','MAPLE','WILLOW','BIRCH','CEDAR','REDWOOD','ASPEN','HICKORY'];
begin
  if fam is null then raise exception 'no family'; end if;
  loop
    attempt := attempt + 1;
    begin
      insert into neighborhoods (name, join_code, created_by_family_id)
      values (
        p_name,
        words[1 + floor(random() * array_length(words,1))::int]
          || '-' || (1000 + floor(random() * 9000)::int)::text,
        fam
      )
      returning * into n;
      exit;
    exception when unique_violation then
      if attempt > 8 then raise; end if;
    end;
  end loop;
  insert into neighborhood_members (neighborhood_id, family_id) values (n.id, fam);
  return n;
end
$$;

-- Join a neighborhood by code. Returns the neighborhood row.
create or replace function join_neighborhood(p_code text)
returns neighborhoods
language plpgsql
security definer
set search_path = public
as $$
declare
  fam uuid := auth_family_id();
  n   neighborhoods;
begin
  if fam is null then raise exception 'no family'; end if;
  select * into n from neighborhoods where join_code = upper(trim(p_code));
  if not found then raise exception 'no such neighborhood'; end if;
  insert into neighborhood_members (neighborhood_id, family_id) values (n.id, fam)
    on conflict do nothing;
  return n;
end
$$;

-- Leave a neighborhood. Removes membership; doesn't delete the neighborhood.
create or replace function leave_neighborhood(p_neighborhood_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth_family_id() is null then raise exception 'no family'; end if;
  delete from neighborhood_members
   where neighborhood_id = p_neighborhood_id and family_id = auth_family_id();
end
$$;

-- Anonymized leaderboard for a single neighborhood.
-- Returns ONLY: handle, avatar_color, balance, reading_minutes_this_week.
-- Never returns kid_id, name, family info — that's the point.
-- Caller must be a member of the neighborhood.
create or replace function get_neighborhood_leaderboard(p_neighborhood_id uuid)
returns table (
  handle                     text,
  avatar_color               text,
  balance                    int,
  reading_minutes_this_week  int,
  is_mine                    boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  fam uuid := auth_family_id();
  authorized boolean;
  week_start date := current_date - extract(dow from current_date)::int;
begin
  if fam is null then raise exception 'no family'; end if;
  select exists (
    select 1 from neighborhood_members nm
    where nm.neighborhood_id = p_neighborhood_id and nm.family_id = fam
  ) into authorized;
  if not authorized then raise exception 'not a member of that neighborhood'; end if;

  return query
    select
      k.handle,
      k.avatar_color,
      coalesce((select sum(t.delta)::int from transactions t where t.kid_id = k.id), 0) as balance,
      coalesce((
        select sum(r.minutes)::int
        from reading_log r
        where r.kid_id = k.id
          and r.status = 'approved'
          and r.approved_at >= week_start::timestamptz
      ), 0) as reading_minutes_this_week,
      (k.family_id = fam) as is_mine
    from kids k
    join neighborhood_members nm on nm.family_id = k.family_id
    where nm.neighborhood_id = p_neighborhood_id
      and k.archived = false
      and k.leaderboard_opt_in = true
      and k.handle is not null;
end
$$;

-- Cheap availability check for a proposed handle. Returns true if the handle is free.
create or replace function handle_available(p_handle text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from kids where lower(handle) = lower(trim(p_handle)));
$$;
