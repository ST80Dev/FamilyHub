-- "Esci dalla famiglia / elimina famiglia" per nuclei solo-owner.
--
-- Demote di tutti i record della famiglia nello scope personale
-- dell'owner, poi DELETE della famiglia. Inverso simmetrico di
-- promote_personal_to_family.
--
-- Vincolato a famiglie con un solo membro: con più membri la demote
-- "verso un singolo utente" perderebbe accesso agli altri e
-- corromperebbe i linked_user_id. In quel caso si va per "esci dal
-- nucleo" senza demote (lo gestiremo quando avremo davvero più membri).

create or replace function public.demote_family_to_personal(
  target_family uuid
) returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  member_count int;
  result jsonb := '{}'::jsonb;
  n int;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_family_owner(target_family) then
    raise exception 'Solo l''owner può sciogliere la famiglia';
  end if;

  select count(*) into member_count
    from public.family_members
   where family_id = target_family;

  if member_count > 1 then
    raise exception 'La famiglia ha più membri: rimuovi gli altri prima di scioglierla';
  end if;

  update public.persons set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('persons', n);

  update public.vehicles set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('vehicles', n);

  update public.pets set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('pets', n);

  update public.deadlines set owner_user_id = uid, family_id = null,
                              assigned_to_member_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('deadlines', n);

  update public.subscriptions set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('subscriptions', n);

  update public.warranties set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('warranties', n);

  update public.vouchers set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('vouchers', n);

  update public.home_maintenance set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('home_maintenance', n);

  update public.payment_methods set owner_user_id = uid, family_id = null
    where family_id = target_family;
  get diagnostics n = row_count;
  result := result || jsonb_build_object('payment_methods', n);

  -- L'unico family_member rimanente è il chiamante: il DELETE famiglia
  -- ON DELETE CASCADE rimuove anche la riga in family_members.
  delete from public.families where id = target_family;

  return result;
end;
$$;

revoke all on function public.demote_family_to_personal(uuid) from public, anon;
grant execute on function public.demote_family_to_personal(uuid) to authenticated;
