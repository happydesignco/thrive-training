-- Row Level Security policies for Tally.
-- Run AFTER 001_schema.sql.

-- ============================================================
-- Families
-- ============================================================
alter table families enable row level security;

-- A parent can see their own family. Anyone authenticated can look up a family by invite_code
-- when initiating a cross-family transfer (handled via a dedicated RPC that returns limited fields).
drop policy if exists families_select_own on families;
create policy families_select_own on families
  for select using (id = auth_family_id());

drop policy if exists families_update_own on families;
create policy families_update_own on families
  for update using (id = auth_family_id())
  with check (id = auth_family_id());

-- Insert is handled exclusively through the create_family RPC (security definer).
-- No direct insert policy; clients cannot insert families.

-- ============================================================
-- Family members
-- ============================================================
alter table family_members enable row level security;

drop policy if exists family_members_select_own on family_members;
create policy family_members_select_own on family_members
  for select using (family_id = auth_family_id());

-- Insert/update/delete all happen via create_family RPC.

-- ============================================================
-- Kids
-- ============================================================
alter table kids enable row level security;

drop policy if exists kids_select_own_family on kids;
create policy kids_select_own_family on kids
  for select using (family_id = auth_family_id());

drop policy if exists kids_insert_own_family on kids;
create policy kids_insert_own_family on kids
  for insert with check (family_id = auth_family_id());

drop policy if exists kids_update_own_family on kids;
create policy kids_update_own_family on kids
  for update using (family_id = auth_family_id())
  with check (family_id = auth_family_id());

drop policy if exists kids_delete_own_family on kids;
create policy kids_delete_own_family on kids
  for delete using (family_id = auth_family_id());

-- ============================================================
-- Transactions
-- ============================================================
alter table transactions enable row level security;

drop policy if exists transactions_select_own_family on transactions;
create policy transactions_select_own_family on transactions
  for select using (
    exists (select 1 from kids k where k.id = transactions.kid_id and k.family_id = auth_family_id())
  );

drop policy if exists transactions_insert_own_family on transactions;
create policy transactions_insert_own_family on transactions
  for insert with check (
    exists (select 1 from kids k where k.id = transactions.kid_id and k.family_id = auth_family_id())
  );

-- No update/delete from clients; transactions are append-only ledger entries.

-- ============================================================
-- Reading log
-- ============================================================
alter table reading_log enable row level security;

drop policy if exists reading_select_own_family on reading_log;
create policy reading_select_own_family on reading_log
  for select using (
    exists (select 1 from kids k where k.id = reading_log.kid_id and k.family_id = auth_family_id())
  );

drop policy if exists reading_insert_own_family on reading_log;
create policy reading_insert_own_family on reading_log
  for insert with check (
    exists (select 1 from kids k where k.id = reading_log.kid_id and k.family_id = auth_family_id())
  );

drop policy if exists reading_update_own_family on reading_log;
create policy reading_update_own_family on reading_log
  for update using (
    exists (select 1 from kids k where k.id = reading_log.kid_id and k.family_id = auth_family_id())
  );

-- ============================================================
-- Transfers (cross-family: visible to either side)
-- ============================================================
alter table transfers enable row level security;

drop policy if exists transfers_select_either_side on transfers;
create policy transfers_select_either_side on transfers
  for select using (
    exists (select 1 from kids k where k.id = transfers.from_kid_id and k.family_id = auth_family_id())
    or
    exists (select 1 from kids k where k.id = transfers.to_kid_id   and k.family_id = auth_family_id())
  );

-- Inserting a transfer must originate from the SENDER's family.
drop policy if exists transfers_insert_sender_only on transfers;
create policy transfers_insert_sender_only on transfers
  for insert with check (
    exists (select 1 from kids k where k.id = transfers.from_kid_id and k.family_id = auth_family_id())
  );

-- Updates allowed by either side (each parent records their own decision; settlement done via RPC).
drop policy if exists transfers_update_either_side on transfers;
create policy transfers_update_either_side on transfers
  for update using (
    exists (select 1 from kids k where k.id = transfers.from_kid_id and k.family_id = auth_family_id())
    or
    exists (select 1 from kids k where k.id = transfers.to_kid_id   and k.family_id = auth_family_id())
  );

-- ============================================================
-- Weekly cashouts
-- ============================================================
alter table weekly_cashouts enable row level security;

drop policy if exists cashouts_select_own_family on weekly_cashouts;
create policy cashouts_select_own_family on weekly_cashouts
  for select using (
    exists (select 1 from kids k where k.id = weekly_cashouts.kid_id and k.family_id = auth_family_id())
  );

drop policy if exists cashouts_insert_own_family on weekly_cashouts;
create policy cashouts_insert_own_family on weekly_cashouts
  for insert with check (
    exists (select 1 from kids k where k.id = weekly_cashouts.kid_id and k.family_id = auth_family_id())
  );
