-- persons
create table public.persons (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null,
  birth_date date,
  comune_residenza text,
  is_minor boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index persons_family_idx on public.persons(family_id);
create trigger persons_set_updated before update on public.persons
  for each row execute function public.set_updated_at();

alter table public.persons enable row level security;
create policy "persons_select" on public.persons for select to authenticated
  using (public.is_family_member(family_id));
create policy "persons_insert" on public.persons for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "persons_update" on public.persons for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "persons_delete" on public.persons for delete to authenticated
  using (public.is_family_member(family_id));

-- vehicles
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  plate text not null,
  type vehicle_type not null default 'auto',
  brand text,
  model text,
  first_registration_date date,
  fuel_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicles_family_idx on public.vehicles(family_id);
create index vehicles_person_idx on public.vehicles(person_id);
create trigger vehicles_set_updated before update on public.vehicles
  for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;
create policy "vehicles_select" on public.vehicles for select to authenticated
  using (public.is_family_member(family_id));
create policy "vehicles_insert" on public.vehicles for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "vehicles_update" on public.vehicles for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "vehicles_delete" on public.vehicles for delete to authenticated
  using (public.is_family_member(family_id));

-- pets
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  species text,
  breed text,
  birth_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pets_family_idx on public.pets(family_id);
create trigger pets_set_updated before update on public.pets
  for each row execute function public.set_updated_at();

alter table public.pets enable row level security;
create policy "pets_select" on public.pets for select to authenticated
  using (public.is_family_member(family_id));
create policy "pets_insert" on public.pets for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "pets_update" on public.pets for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "pets_delete" on public.pets for delete to authenticated
  using (public.is_family_member(family_id));
