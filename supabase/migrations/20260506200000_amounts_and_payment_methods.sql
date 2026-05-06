-- Phase 1: importi sulle scadenze + metodi di pagamento
--
-- 1. Aggiunge importo + flag "stimato" alle scadenze
-- 2. Crea la tabella payment_methods (carta credito/debito, c/c, altro) con
--    scope famiglia XOR utente, RLS coerente con le altre tabelle dati
-- 3. Aggiunge payment_method_id su deadlines e subscriptions con cross-scope
--    check (un metodo personale non può essere associato a un record familiare
--    e viceversa)

-- 1. Importi su scadenze ------------------------------------------------------

alter table public.deadlines
  add column amount numeric(12,2),
  add column amount_is_estimated boolean not null default false,
  add column currency text not null default 'EUR';

-- 2. Metodi di pagamento ------------------------------------------------------

create type payment_method_type as enum (
  'credit_card', 'debit_card', 'bank_account', 'other'
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  type payment_method_type not null default 'credit_card',
  label text not null,
  issuer text,
  last4 text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_methods_scope_xor
    check ((family_id is not null) <> (owner_user_id is not null)),
  constraint payment_methods_last4_format
    check (last4 is null or last4 ~ '^[0-9]{2,4}$')
);

create index payment_methods_family_idx on public.payment_methods(family_id);
create index payment_methods_owner_idx on public.payment_methods(owner_user_id);

create trigger payment_methods_set_updated before update on public.payment_methods
  for each row execute function public.set_updated_at();

alter table public.payment_methods enable row level security;

create policy "payment_methods_select" on public.payment_methods for select to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "payment_methods_insert" on public.payment_methods for insert to authenticated
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "payment_methods_update" on public.payment_methods for update to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  )
  with check (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );
create policy "payment_methods_delete" on public.payment_methods for delete to authenticated
  using (
    (family_id is not null and public.is_family_member(family_id))
    or owner_user_id = auth.uid()
  );

-- 3. FK payment_method_id su deadlines + subscriptions -----------------------

alter table public.deadlines
  add column payment_method_id uuid references public.payment_methods(id) on delete set null;
create index deadlines_payment_method_idx on public.deadlines(payment_method_id);

alter table public.subscriptions
  add column payment_method_id uuid references public.payment_methods(id) on delete set null;
create index subscriptions_payment_method_idx on public.subscriptions(payment_method_id);

-- 4. Cross-scope check: il metodo deve avere lo stesso scope del record ------
-- Estendiamo i trigger esistenti deadlines_check_scope e
-- subscriptions_check_scope.

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
  if new.payment_method_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.payment_methods where id = new.payment_method_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Metodo di pagamento');
  end if;
  if new.owner_user_id is not null and new.assigned_to_member_id is not null then
    raise exception 'Le scadenze personali non possono essere assegnate a un membro';
  end if;
  return new;
end;
$$;

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
  if new.payment_method_id is not null then
    select family_id, owner_user_id into p_fam, p_own
    from public.payment_methods where id = new.payment_method_id;
    perform public.assert_same_scope(new.family_id, new.owner_user_id, p_fam, p_own, 'Metodo di pagamento');
  end if;
  return new;
end;
$$;

-- 5. Estendere promote_personal_to_family per spostare anche i payment_methods

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
    'warranties','vouchers','home_maintenance','payment_methods'
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
  if 'payment_methods' = any(cats) then
    update public.payment_methods set family_id = target_family, owner_user_id = null
    where owner_user_id = uid;
    get diagnostics n = row_count;
    result := result || jsonb_build_object('payment_methods', n);
  end if;

  return result;
end;
$$;
