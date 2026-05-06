-- Optional family ownership: every "data" record may belong either to a family
-- (family_id) OR to a single user (owner_user_id), in mutual exclusion.
-- Scope: persons, vehicles, pets, deadlines, subscriptions, warranties,
-- vouchers, home_maintenance.

-- 1. Schema changes -----------------------------------------------------------

alter table public.persons
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint persons_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.vehicles
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint vehicles_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.pets
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint pets_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.deadlines
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint deadlines_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.subscriptions
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint subscriptions_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.warranties
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint warranties_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.vouchers
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint vouchers_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

alter table public.home_maintenance
  alter column family_id drop not null,
  add column owner_user_id uuid references auth.users(id) on delete cascade,
  add constraint home_maintenance_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null));

-- Per-owner indexes for filtering personal records
create index persons_owner_idx on public.persons(owner_user_id);
create index vehicles_owner_idx on public.vehicles(owner_user_id);
create index pets_owner_idx on public.pets(owner_user_id);
create index deadlines_owner_idx on public.deadlines(owner_user_id);
create index deadlines_owner_due_idx
  on public.deadlines(owner_user_id, due_date);
create index subscriptions_owner_idx on public.subscriptions(owner_user_id);
create index subscriptions_owner_next_idx
  on public.subscriptions(owner_user_id, next_billing_date);
create index warranties_owner_idx on public.warranties(owner_user_id);
create index warranties_owner_expiry_idx
  on public.warranties(owner_user_id, expiry_date);
create index vouchers_owner_idx on public.vouchers(owner_user_id);
create index vouchers_owner_expiry_idx
  on public.vouchers(owner_user_id, expiry_date);
create index home_maintenance_owner_idx
  on public.home_maintenance(owner_user_id);
create index home_maintenance_owner_due_idx
  on public.home_maintenance(owner_user_id, next_due_date);

-- 2. RLS rewrite --------------------------------------------------------------
-- Pattern: visible if I am a member of the record's family, OR I own the record.

-- persons
drop policy if exists "persons_select" on public.persons;
drop policy if exists "persons_insert" on public.persons;
drop policy if exists "persons_update" on public.persons;
drop policy if exists "persons_delete" on public.persons;

create policy "persons_select" on public.persons for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "persons_insert" on public.persons for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "persons_update" on public.persons for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "persons_delete" on public.persons for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- vehicles
drop policy if exists "vehicles_select" on public.vehicles;
drop policy if exists "vehicles_insert" on public.vehicles;
drop policy if exists "vehicles_update" on public.vehicles;
drop policy if exists "vehicles_delete" on public.vehicles;

create policy "vehicles_select" on public.vehicles for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "vehicles_insert" on public.vehicles for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "vehicles_update" on public.vehicles for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "vehicles_delete" on public.vehicles for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- pets
drop policy if exists "pets_select" on public.pets;
drop policy if exists "pets_insert" on public.pets;
drop policy if exists "pets_update" on public.pets;
drop policy if exists "pets_delete" on public.pets;

create policy "pets_select" on public.pets for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "pets_insert" on public.pets for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "pets_update" on public.pets for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "pets_delete" on public.pets for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- deadlines
drop policy if exists "deadlines_select" on public.deadlines;
drop policy if exists "deadlines_insert" on public.deadlines;
drop policy if exists "deadlines_update" on public.deadlines;
drop policy if exists "deadlines_delete" on public.deadlines;

create policy "deadlines_select" on public.deadlines for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "deadlines_insert" on public.deadlines for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "deadlines_update" on public.deadlines for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "deadlines_delete" on public.deadlines for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- subscriptions
drop policy if exists "subscriptions_select" on public.subscriptions;
drop policy if exists "subscriptions_insert" on public.subscriptions;
drop policy if exists "subscriptions_update" on public.subscriptions;
drop policy if exists "subscriptions_delete" on public.subscriptions;

create policy "subscriptions_select" on public.subscriptions for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "subscriptions_insert" on public.subscriptions for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "subscriptions_update" on public.subscriptions for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "subscriptions_delete" on public.subscriptions for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- warranties
drop policy if exists "warranties_select" on public.warranties;
drop policy if exists "warranties_insert" on public.warranties;
drop policy if exists "warranties_update" on public.warranties;
drop policy if exists "warranties_delete" on public.warranties;

create policy "warranties_select" on public.warranties for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "warranties_insert" on public.warranties for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "warranties_update" on public.warranties for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "warranties_delete" on public.warranties for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- vouchers
drop policy if exists "vouchers_select" on public.vouchers;
drop policy if exists "vouchers_insert" on public.vouchers;
drop policy if exists "vouchers_update" on public.vouchers;
drop policy if exists "vouchers_delete" on public.vouchers;

create policy "vouchers_select" on public.vouchers for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "vouchers_insert" on public.vouchers for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "vouchers_update" on public.vouchers for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "vouchers_delete" on public.vouchers for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- home_maintenance
drop policy if exists "home_maintenance_select" on public.home_maintenance;
drop policy if exists "home_maintenance_insert" on public.home_maintenance;
drop policy if exists "home_maintenance_update" on public.home_maintenance;
drop policy if exists "home_maintenance_delete" on public.home_maintenance;

create policy "home_maintenance_select" on public.home_maintenance for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "home_maintenance_insert" on public.home_maintenance for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "home_maintenance_update" on public.home_maintenance for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "home_maintenance_delete" on public.home_maintenance for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- 3. Cross-scope validation triggers -----------------------------------------
-- A child record's parent FKs must share the same scope (same family OR same
-- owner). Prevents personal deadlines pointing to family vehicles, etc.

create or replace function public.assert_same_scope(
  child_family uuid, child_owner uuid,
  parent_family uuid, parent_owner uuid,
  parent_label text
) returns void
language plpgsql immutable
set search_path = public
as $$
begin
  if child_family is distinct from parent_family
     or child_owner is distinct from parent_owner then
    raise exception '% fuori scope: il record padre appartiene a un nucleo o utente diverso',
      parent_label;
  end if;
end;
$$;

-- vehicles → persons
create or replace function public.vehicles_check_scope() returns trigger
language plpgsql
set search_path = public
as $$
declare p_fam uuid; p_own uuid;
begin
  if new.person_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.persons where id = new.person_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Persona');
  end if;
  return new;
end;
$$;

create trigger vehicles_scope_check
  before insert or update on public.vehicles
  for each row execute function public.vehicles_check_scope();

-- deadlines → persons, vehicles, pets; assigned_to_member_id null if personal
create or replace function public.deadlines_check_scope() returns trigger
language plpgsql
set search_path = public
as $$
declare p_fam uuid; p_own uuid;
begin
  if new.person_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.persons where id = new.person_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Persona');
  end if;
  if new.vehicle_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.vehicles where id = new.vehicle_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Veicolo');
  end if;
  if new.pet_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.pets where id = new.pet_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Animale');
  end if;
  if new.owner_user_id is not null and new.assigned_to_member_id is not null then
    raise exception 'Le scadenze personali non possono essere assegnate a un membro';
  end if;
  return new;
end;
$$;

create trigger deadlines_scope_check
  before insert or update on public.deadlines
  for each row execute function public.deadlines_check_scope();

-- subscriptions → persons
create or replace function public.subscriptions_check_scope() returns trigger
language plpgsql
set search_path = public
as $$
declare p_fam uuid; p_own uuid;
begin
  if new.person_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.persons where id = new.person_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Persona');
  end if;
  return new;
end;
$$;

create trigger subscriptions_scope_check
  before insert or update on public.subscriptions
  for each row execute function public.subscriptions_check_scope();

-- warranties → persons
create or replace function public.warranties_check_scope() returns trigger
language plpgsql
set search_path = public
as $$
declare p_fam uuid; p_own uuid;
begin
  if new.person_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.persons where id = new.person_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Persona');
  end if;
  return new;
end;
$$;

create trigger warranties_scope_check
  before insert or update on public.warranties
  for each row execute function public.warranties_check_scope();

-- vouchers → persons
create or replace function public.vouchers_check_scope() returns trigger
language plpgsql
set search_path = public
as $$
declare p_fam uuid; p_own uuid;
begin
  if new.person_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.persons where id = new.person_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Persona');
  end if;
  return new;
end;
$$;

create trigger vouchers_scope_check
  before insert or update on public.vouchers
  for each row execute function public.vouchers_check_scope();

-- home_maintenance → vehicles, pets
create or replace function public.home_maintenance_check_scope() returns trigger
language plpgsql
set search_path = public
as $$
declare p_fam uuid; p_own uuid;
begin
  if new.vehicle_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.vehicles where id = new.vehicle_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Veicolo');
  end if;
  if new.pet_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.pets where id = new.pet_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Animale');
  end if;
  return new;
end;
$$;

create trigger home_maintenance_scope_check
  before insert or update on public.home_maintenance
  for each row execute function public.home_maintenance_check_scope();

-- 4. Promotion RPC: move all personal records of the caller to a family ------
-- Used after the user creates/joins a family and confirms the prompt.
-- Returns a JSON object with per-table counts.

create or replace function public.promote_personal_to_family(
  target_family uuid,
  categories text[] default null
) returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result jsonb := '{}'::jsonb;
  n int;
  cats text[];
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_family_member(target_family) then
    raise exception 'Non sei membro di questa famiglia';
  end if;

  cats := coalesce(categories, array[
    'persons','vehicles','pets','deadlines','subscriptions',
    'warranties','vouchers','home_maintenance'
  ]);

  if 'persons' = any(cats) then
    update public.persons set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('persons', n);
  end if;
  if 'vehicles' = any(cats) then
    update public.vehicles set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('vehicles', n);
  end if;
  if 'pets' = any(cats) then
    update public.pets set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('pets', n);
  end if;
  if 'deadlines' = any(cats) then
    update public.deadlines set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('deadlines', n);
  end if;
  if 'subscriptions' = any(cats) then
    update public.subscriptions set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('subscriptions', n);
  end if;
  if 'warranties' = any(cats) then
    update public.warranties set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('warranties', n);
  end if;
  if 'vouchers' = any(cats) then
    update public.vouchers set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('vouchers', n);
  end if;
  if 'home_maintenance' = any(cats) then
    update public.home_maintenance set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('home_maintenance', n);
  end if;

  return result;
end;
$$;

revoke all on function public.promote_personal_to_family(uuid, text[]) from public, anon;
grant execute on function public.promote_personal_to_family(uuid, text[]) to authenticated;
