-- RPCs (stored procedures) for Tally.
-- These run with elevated privilege where needed (cross-family settlement, family creation).
-- Run AFTER 002_rls.sql.

-- ============================================================
-- create_family: bootstrap a new family + add the caller as parent.
-- Called once after a parent signs up.
-- ============================================================
create or replace function create_family(p_name text)
returns families
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family families;
  attempt int := 0;
begin
  if auth.uid() is null then
    raise exception 'must be authenticated';
  end if;

  if exists (select 1 from family_members where user_id = auth.uid()) then
    raise exception 'user already belongs to a family';
  end if;

  -- Generate a unique invite code, retry on rare collisions.
  loop
    attempt := attempt + 1;
    begin
      insert into families (name, invite_code)
      values (p_name, generate_invite_code())
      returning * into new_family;
      exit;
    exception when unique_violation then
      if attempt > 8 then raise; end if;
    end;
  end loop;

  insert into family_members (user_id, family_id, role)
  values (auth.uid(), new_family.id, 'parent');

  return new_family;
end
$$;

-- ============================================================
-- lookup_family_by_invite: limited-field lookup for transfer initiation.
-- Returns nothing if marketplace is disabled.
-- ============================================================
create or replace function lookup_family_by_invite(p_code text)
returns table (
  family_id     uuid,
  family_name   text,
  kid_id        uuid,
  kid_name      text,
  avatar_color  text
)
language sql
security definer
set search_path = public
as $$
  select f.id, f.name, k.id, k.name, k.avatar_color
  from families f
  join kids k on k.family_id = f.id and k.archived = false
  where f.invite_code = upper(trim(p_code))
    and f.marketplace_enabled = true
    and exists (select 1 from families self where self.id = auth_family_id() and self.marketplace_enabled = true)
$$;

-- ============================================================
-- approve_transfer: settle a transfer.
-- The CALLER's role is inferred:
--   - If they own from_kid's family → records sender_parent_decision
--   - If they own to_kid's family   → records recipient_parent_decision
-- When both sides have approved (or same_family is true and the single side approved),
-- inserts the matching transactions atomically and marks transfer 'approved'.
-- ============================================================
create or replace function approve_transfer(p_transfer_id uuid)
returns transfers
language plpgsql
security definer
set search_path = public
as $$
declare
  t transfers;
  caller_family uuid;
  from_family   uuid;
  to_family     uuid;
  sender_balance int;
  now_ts timestamptz := now();
  this_week_anchor date := current_date - extract(dow from current_date)::int;
begin
  if auth.uid() is null then raise exception 'must be authenticated'; end if;
  caller_family := auth_family_id();
  if caller_family is null then raise exception 'no family'; end if;

  select * into t from transfers where id = p_transfer_id for update;
  if not found then raise exception 'transfer not found'; end if;
  if t.status <> 'pending' then raise exception 'transfer is %', t.status; end if;

  select family_id into from_family from kids where id = t.from_kid_id;
  select family_id into to_family   from kids where id = t.to_kid_id;

  if caller_family <> from_family and caller_family <> to_family then
    raise exception 'not authorized';
  end if;

  if caller_family = from_family then
    if t.sender_parent_decision is not null then raise exception 'sender side already decided'; end if;
    update transfers
       set sender_parent_decision = 'approved',
           sender_parent_at = now_ts,
           sender_parent_user_id = auth.uid()
     where id = p_transfer_id
     returning * into t;
  end if;

  if caller_family = to_family and not t.same_family then
    if t.recipient_parent_decision is not null then raise exception 'recipient side already decided'; end if;
    update transfers
       set recipient_parent_decision = 'approved',
           recipient_parent_at = now_ts,
           recipient_parent_user_id = auth.uid()
     where id = p_transfer_id
     returning * into t;
  end if;

  -- Settle when both required approvals are in.
  if t.sender_parent_decision = 'approved'
     and (t.same_family or t.recipient_parent_decision = 'approved') then

    -- Re-check sender has enough tokens at settlement time.
    select coalesce(sum(delta), 0) into sender_balance from transactions where kid_id = t.from_kid_id;
    if sender_balance < t.amount then
      raise exception 'sender has insufficient tokens (% < %)', sender_balance, t.amount;
    end if;

    insert into transactions (kid_id, delta, kind, note, related_transfer_id, week_anchor, created_by_user_id)
    values (t.from_kid_id, -t.amount, 'transfer_out',
            coalesce(t.note, 'Sent tokens'), t.id, this_week_anchor, auth.uid());

    insert into transactions (kid_id, delta, kind, note, related_transfer_id, week_anchor, created_by_user_id)
    values (t.to_kid_id,    t.amount, 'transfer_in',
            coalesce(t.note, 'Received tokens'), t.id, this_week_anchor, auth.uid());

    update transfers set status = 'approved', completed_at = now_ts
     where id = p_transfer_id
     returning * into t;
  end if;

  return t;
end
$$;

-- ============================================================
-- reject_transfer: mark a transfer rejected by either side.
-- ============================================================
create or replace function reject_transfer(p_transfer_id uuid, p_reason text default null)
returns transfers
language plpgsql
security definer
set search_path = public
as $$
declare
  t transfers;
  caller_family uuid;
  from_family uuid;
  to_family   uuid;
begin
  if auth.uid() is null then raise exception 'must be authenticated'; end if;
  caller_family := auth_family_id();

  select * into t from transfers where id = p_transfer_id for update;
  if not found then raise exception 'transfer not found'; end if;
  if t.status <> 'pending' then raise exception 'transfer is %', t.status; end if;

  select family_id into from_family from kids where id = t.from_kid_id;
  select family_id into to_family   from kids where id = t.to_kid_id;

  if caller_family <> from_family and caller_family <> to_family then
    raise exception 'not authorized';
  end if;

  update transfers
     set status = 'rejected',
         note   = coalesce(p_reason, note),
         completed_at = now()
   where id = p_transfer_id
   returning * into t;

  return t;
end
$$;

-- ============================================================
-- approve_reading: parent approves a reading entry, awards tokens.
-- ============================================================
create or replace function approve_reading(p_reading_id uuid)
returns reading_log
language plpgsql
security definer
set search_path = public
as $$
declare
  r reading_log;
  k kids;
  f families;
  tokens int;
  this_week_anchor date := current_date - extract(dow from current_date)::int;
begin
  if auth.uid() is null then raise exception 'must be authenticated'; end if;

  select * into r from reading_log where id = p_reading_id for update;
  if not found then raise exception 'reading not found'; end if;
  if r.status <> 'pending' then raise exception 'reading already %', r.status; end if;

  select * into k from kids where id = r.kid_id;
  if k.family_id <> auth_family_id() then raise exception 'not authorized'; end if;

  select * into f from families where id = k.family_id;
  tokens := greatest(1, r.minutes / f.reading_minutes_per_token);

  update reading_log
     set status = 'approved', tokens_awarded = tokens,
         approved_by = auth.uid(), approved_at = now()
   where id = p_reading_id
   returning * into r;

  insert into transactions (kid_id, delta, kind, note, related_reading_id, week_anchor, created_by_user_id)
  values (k.id, tokens, 'reading_earned',
          coalesce('Read ' || r.minutes || ' min' || case when r.book_title is not null then ' — ' || r.book_title else '' end, 'Reading'),
          r.id, this_week_anchor, auth.uid());

  return r;
end
$$;

-- ============================================================
-- reject_reading: parent denies a reading entry (no tokens awarded).
-- ============================================================
create or replace function reject_reading(p_reading_id uuid)
returns reading_log
language plpgsql
security definer
set search_path = public
as $$
declare r reading_log;
begin
  if auth.uid() is null then raise exception 'must be authenticated'; end if;
  select * into r from reading_log where id = p_reading_id for update;
  if not found then raise exception 'reading not found'; end if;
  if not exists (select 1 from kids k where k.id = r.kid_id and k.family_id = auth_family_id()) then
    raise exception 'not authorized';
  end if;
  if r.status <> 'pending' then raise exception 'reading already %', r.status; end if;
  update reading_log set status = 'rejected', approved_by = auth.uid(), approved_at = now()
   where id = p_reading_id
   returning * into r;
  return r;
end
$$;

-- ============================================================
-- close_week: snapshot a kid's week and award cashout cents.
-- Idempotent per (kid, week_anchor): if a snapshot exists, returns it without re-applying cashout.
-- ============================================================
create or replace function close_week(p_kid_id uuid, p_week_anchor date)
returns weekly_cashouts
language plpgsql
security definer
set search_path = public
as $$
declare
  k kids;
  f families;
  existing weekly_cashouts;
  starting_tokens int := 0;
  earned int := 0;
  spent  int := 0;
  t_in   int := 0;
  t_out  int := 0;
  remaining int;
  cents int;
  snap weekly_cashouts;
begin
  if auth.uid() is null then raise exception 'must be authenticated'; end if;
  select * into k from kids where id = p_kid_id;
  if not found or k.family_id <> auth_family_id() then raise exception 'not authorized'; end if;

  select * into existing from weekly_cashouts where kid_id = p_kid_id and week_anchor = p_week_anchor;
  if found then return existing; end if;

  select * into f from families where id = k.family_id;

  -- Balance at start of this week = sum of all transactions strictly before p_week_anchor.
  select coalesce(sum(delta),0) into starting_tokens
    from transactions
   where kid_id = p_kid_id
     and created_at < p_week_anchor::timestamptz;

  select
    coalesce(sum(case when kind in ('weekly_allowance','reading_earned','manual_grant') then delta else 0 end), 0),
    coalesce(sum(case when kind in ('screen_time_spent','manual_deduct') then -delta else 0 end), 0),
    coalesce(sum(case when kind = 'transfer_in'  then delta else 0 end), 0),
    coalesce(sum(case when kind = 'transfer_out' then -delta else 0 end), 0)
  into earned, spent, t_in, t_out
    from transactions
   where kid_id = p_kid_id
     and week_anchor = p_week_anchor;

  remaining := starting_tokens + earned - spent + t_in - t_out;
  if remaining < 0 then remaining := 0; end if;
  cents := remaining * f.cash_per_unspent_token_cents;

  insert into weekly_cashouts (
    kid_id, week_anchor, starting_tokens, earned_tokens, spent_tokens,
    transfer_in, transfer_out, remaining_tokens, cents_earned, closed_by_user_id
  ) values (
    p_kid_id, p_week_anchor, starting_tokens, earned, spent, t_in, t_out, remaining, cents, auth.uid()
  ) returning * into snap;

  -- Record the cashout as a transaction so the running balance "resets" by zeroing out remaining
  -- and re-seeds next week's allowance separately. We deduct exactly `remaining`.
  if remaining > 0 then
    insert into transactions (kid_id, delta, kind, note, week_anchor, created_by_user_id)
    values (p_kid_id, -remaining, 'cashout',
            'Weekly cashout: ' || remaining || ' tokens → $' || (cents/100.0)::text,
            p_week_anchor, auth.uid());
  end if;

  return snap;
end
$$;

-- ============================================================
-- start_week: grant the weekly allowance to a kid (idempotent per week).
-- ============================================================
create or replace function start_week(p_kid_id uuid, p_week_anchor date)
returns transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  k kids;
  f families;
  existing transactions;
  tx transactions;
begin
  if auth.uid() is null then raise exception 'must be authenticated'; end if;
  select * into k from kids where id = p_kid_id;
  if not found or k.family_id <> auth_family_id() then raise exception 'not authorized'; end if;

  select * into existing from transactions
   where kid_id = p_kid_id and week_anchor = p_week_anchor and kind = 'weekly_allowance'
   limit 1;
  if found then return existing; end if;

  select * into f from families where id = k.family_id;

  insert into transactions (kid_id, delta, kind, note, week_anchor, created_by_user_id)
  values (p_kid_id, f.weekly_token_allowance, 'weekly_allowance',
          'Weekly allowance', p_week_anchor, auth.uid())
  returning * into tx;

  return tx;
end
$$;
