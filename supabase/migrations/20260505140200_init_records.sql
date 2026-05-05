-- deadlines
create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  pet_id uuid references public.pets(id) on delete set null,
  type deadline_type not null,
  title text,
  due_date date not null,
  reminder_days_before int not null default 30,
  is_recurring boolean not null default false,
  recurrence_months int,
  assigned_to_member_id uuid references public.family_members(id) on delete set null,
  status deadline_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index deadlines_family_idx on public.deadlines(family_id);
create index deadlines_due_idx on public.deadlines(family_id, due_date);
create index deadlines_status_idx on public.deadlines(family_id, status);
create trigger deadlines_set_updated before update on public.deadlines
  for each row execute function public.set_updated_at();

alter table public.deadlines enable row level security;
create policy "deadlines_select" on public.deadlines for select to authenticated
  using (public.is_family_member(family_id));
create policy "deadlines_insert" on public.deadlines for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "deadlines_update" on public.deadlines for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "deadlines_delete" on public.deadlines for delete to authenticated
  using (public.is_family_member(family_id));

-- subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  name text not null,
  provider text,
  category subscription_category not null default 'altro',
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  billing_cycle billing_cycle not null default 'monthly',
  next_billing_date date,
  auto_renews boolean not null default true,
  reminder_days_before int not null default 3,
  status subscription_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_family_idx on public.subscriptions(family_id);
create index subscriptions_next_idx on public.subscriptions(family_id, next_billing_date);
create trigger subscriptions_set_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
create policy "subscriptions_select" on public.subscriptions for select to authenticated
  using (public.is_family_member(family_id));
create policy "subscriptions_insert" on public.subscriptions for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "subscriptions_update" on public.subscriptions for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "subscriptions_delete" on public.subscriptions for delete to authenticated
  using (public.is_family_member(family_id));

-- warranties
create table public.warranties (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  product_name text not null,
  brand text,
  model text,
  serial_number text,
  purchase_date date not null,
  purchase_price numeric(12,2),
  store text,
  warranty_months int not null default 24,
  extended_warranty_months int,
  expiry_date date,
  receipt_image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index warranties_family_idx on public.warranties(family_id);
create index warranties_expiry_idx on public.warranties(family_id, expiry_date);

create or replace function public.warranties_compute_expiry() returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.expiry_date := (new.purchase_date
    + ((new.warranty_months + coalesce(new.extended_warranty_months, 0))
       || ' months')::interval)::date;
  return new;
end;
$$;

create trigger warranties_compute_expiry_ins
  before insert on public.warranties
  for each row execute function public.warranties_compute_expiry();
create trigger warranties_compute_expiry_upd
  before update of purchase_date, warranty_months, extended_warranty_months
  on public.warranties
  for each row execute function public.warranties_compute_expiry();
create trigger warranties_set_updated before update on public.warranties
  for each row execute function public.set_updated_at();

alter table public.warranties enable row level security;
create policy "warranties_select" on public.warranties for select to authenticated
  using (public.is_family_member(family_id));
create policy "warranties_insert" on public.warranties for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "warranties_update" on public.warranties for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "warranties_delete" on public.warranties for delete to authenticated
  using (public.is_family_member(family_id));

-- vouchers
create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  type voucher_type not null default 'altro',
  issuer text not null,
  code text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  issue_date date,
  expiry_date date,
  is_percentage boolean not null default false,
  status voucher_status not null default 'available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vouchers_family_idx on public.vouchers(family_id);
create index vouchers_expiry_idx on public.vouchers(family_id, expiry_date);
create trigger vouchers_set_updated before update on public.vouchers
  for each row execute function public.set_updated_at();

alter table public.vouchers enable row level security;
create policy "vouchers_select" on public.vouchers for select to authenticated
  using (public.is_family_member(family_id));
create policy "vouchers_insert" on public.vouchers for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "vouchers_update" on public.vouchers for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "vouchers_delete" on public.vouchers for delete to authenticated
  using (public.is_family_member(family_id));

-- home_maintenance
create table public.home_maintenance (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  pet_id uuid references public.pets(id) on delete set null,
  category maintenance_category not null default 'altro',
  title text not null,
  last_done_date date,
  interval_type maintenance_interval_type not null default 'months',
  interval_value int,
  next_due_date date,
  current_km int,
  reminder_days_before int not null default 30,
  status maintenance_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index home_maintenance_family_idx on public.home_maintenance(family_id);
create index home_maintenance_due_idx on public.home_maintenance(family_id, next_due_date);
create trigger home_maintenance_set_updated before update on public.home_maintenance
  for each row execute function public.set_updated_at();

alter table public.home_maintenance enable row level security;
create policy "home_maintenance_select" on public.home_maintenance for select to authenticated
  using (public.is_family_member(family_id));
create policy "home_maintenance_insert" on public.home_maintenance for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "home_maintenance_update" on public.home_maintenance for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "home_maintenance_delete" on public.home_maintenance for delete to authenticated
  using (public.is_family_member(family_id));
