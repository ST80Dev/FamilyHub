-- Fase 3 — Integrazione "componenti del nucleo" col concetto di Famiglia.
--
-- Due aggiunte:
--
-- 1) RPC `create_family(p_name, p_display_name?)`
--    L'INSERT diretto su `families` con `... select(...).single()` falliva
--    con "new row violates row-level security policy for table families"
--    perché Postgres valuta la SELECT policy di RETURNING PRIMA che il
--    trigger AFTER INSERT crei la riga in `family_members`. Al momento
--    della valutazione di `is_family_member(id)` la membership non esiste
--    ancora → insert rifiutato in RETURNING. Una RPC SECURITY DEFINER
--    bypassa l'RLS e restituisce la riga in modo affidabile.
--
-- 2) `persons.linked_user_id`
--    Permette di marcare una persona come "Io" (l'utente stesso). La UI
--    pre-mostra una card "Io" e usa questo campo per editare la persona
--    associata all'utente loggato. Unique per scope: al massimo una
--    "Io" personale e una per ciascuna famiglia in cui sono membro.

-- 1. RPC create_family --------------------------------------------------------

create or replace function public.create_family(
  p_name text,
  p_display_name text default null
) returns public.families
language plpgsql security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  fam public.families;
  uname text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_name is null or btrim(p_name) = '' then
    raise exception 'Nome famiglia obbligatorio';
  end if;

  insert into public.families (name) values (btrim(p_name))
  returning * into fam;
  -- trigger families_after_insert ha già inserito il membro owner.

  uname := nullif(btrim(coalesce(p_display_name, '')), '');
  if uname is not null then
    update public.family_members
       set display_name = uname
     where family_id = fam.id and user_id = uid;
  end if;

  return fam;
end;
$$;

revoke all on function public.create_family(text, text) from public, anon;
grant execute on function public.create_family(text, text) to authenticated;

-- 2. persons.linked_user_id ---------------------------------------------------

alter table public.persons
  add column linked_user_id uuid references auth.users(id) on delete set null;

-- Una sola persona "io" per scope (personale o per famiglia)
create unique index persons_linked_user_personal_uniq
  on public.persons (linked_user_id)
  where linked_user_id is not null and owner_user_id is not null;

create unique index persons_linked_user_family_uniq
  on public.persons (linked_user_id, family_id)
  where linked_user_id is not null and family_id is not null;
