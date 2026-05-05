-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type member_role as enum ('owner', 'member');
create type vehicle_type as enum ('auto', 'moto', 'altro');
create type deadline_type as enum (
  'bollo_auto', 'revisione_auto', 'patente', 'cie', 'passaporto', 'spid',
  'esenzione_ticket', 'ricetta_medica', 'visita_medica', 'assicurazione_auto',
  'assicurazione_casa', 'contratto_affitto', 'dichiarazione_redditi',
  'imu', 'tari', 'f24', 'custom'
);
create type deadline_status as enum ('pending', 'done', 'snoozed');
create type subscription_category as enum (
  'streaming', 'musica', 'gaming', 'software', 'palestra',
  'parcheggio', 'assicurazione', 'telefonia', 'internet',
  'giornali', 'cloud_storage', 'altro'
);
create type billing_cycle as enum ('monthly', 'quarterly', 'semiannual', 'annual');
create type subscription_status as enum ('active', 'cancelled', 'paused');
create type voucher_type as enum ('regalo', 'rimborso', 'reso', 'cashback', 'coupon', 'altro');
create type voucher_status as enum ('available', 'used', 'expired');
create type maintenance_category as enum (
  'caldaia', 'filtri_aria', 'estintore', 'tagliando_auto',
  'cambio_gomme', 'visita_veterinaria', 'vaccino_animale',
  'sverminazione', 'pulizia_canne_fumarie', 'altro'
);
create type maintenance_interval_type as enum ('months', 'km', 'once');
create type maintenance_status as enum ('pending', 'done');

-- Helpers
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.generate_invite_code() returns text
language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, 1 + floor(random()*length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

-- Core tables
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default public.generate_invite_code(),
  created_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'member',
  display_name text not null,
  joined_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create index family_members_user_idx on public.family_members(user_id);
create index family_members_family_idx on public.family_members(family_id);

-- SECURITY DEFINER helpers to break RLS recursion
create or replace function public.is_family_member(fid uuid) returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(
    select 1 from public.family_members
    where family_id = fid and user_id = auth.uid()
  );
$$;

create or replace function public.is_family_owner(fid uuid) returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(
    select 1 from public.family_members
    where family_id = fid and user_id = auth.uid() and role = 'owner'
  );
$$;

-- Auto-add creator as owner
create or replace function public.add_creator_as_owner() returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.family_members (family_id, user_id, role, display_name)
    values (new.id, auth.uid(), 'owner',
            coalesce((auth.jwt() ->> 'email'), 'Owner'));
  end if;
  return new;
end;
$$;

create trigger families_after_insert
  after insert on public.families
  for each row execute function public.add_creator_as_owner();

-- Join family by invite code
create or replace function public.join_family_by_code(code text, name text default null)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  fid uuid;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select id into fid from public.families where invite_code = upper(code);
  if fid is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.family_members (family_id, user_id, role, display_name)
  values (fid, uid, 'member', coalesce(name, (auth.jwt() ->> 'email'), 'Membro'))
  on conflict (family_id, user_id) do nothing;

  return fid;
end;
$$;

revoke all on function public.join_family_by_code(text, text) from public, anon;
grant execute on function public.join_family_by_code(text, text) to authenticated;

revoke all on function public.is_family_member(uuid) from public, anon;
revoke all on function public.is_family_owner(uuid) from public, anon;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_owner(uuid) to authenticated;

revoke all on function public.add_creator_as_owner() from public, anon, authenticated;

alter function public.set_updated_at() set search_path = public;
alter function public.generate_invite_code() set search_path = public;

-- RLS: families
alter table public.families enable row level security;

create policy "families_select_members" on public.families
  for select to authenticated using (public.is_family_member(id));
create policy "families_insert_authenticated" on public.families
  for insert to authenticated with check (auth.uid() is not null);
create policy "families_update_owners" on public.families
  for update to authenticated
  using (public.is_family_owner(id))
  with check (public.is_family_owner(id));
create policy "families_delete_owners" on public.families
  for delete to authenticated using (public.is_family_owner(id));

-- RLS: family_members
alter table public.family_members enable row level security;

create policy "members_select_same_family" on public.family_members
  for select to authenticated using (public.is_family_member(family_id));
create policy "members_insert_self_or_owner" on public.family_members
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_family_owner(family_id));
create policy "members_update_self_or_owner" on public.family_members
  for update to authenticated
  using (user_id = auth.uid() or public.is_family_owner(family_id))
  with check (user_id = auth.uid() or public.is_family_owner(family_id));
create policy "members_delete_self_or_owner" on public.family_members
  for delete to authenticated
  using (user_id = auth.uid() or public.is_family_owner(family_id));
