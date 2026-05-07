-- Subscription cancellation forecast
--
-- Aggiunge a `subscriptions` due colonne per pianificare la disdetta:
--
--   planned_end_date          data prevista in cui l'abbonamento finirà
--                             (l'utente la inserisce in UI con tre modalità:
--                             "fra N mesi", "mese/anno", "data esatta").
--   cancellation_notice_days  giorni di preavviso obbligatori per disdire;
--                             usati lato UI per calcolare la "data limite
--                             entro cui disdire" = planned_end_date - giorni.
--
-- Niente trigger né record derivati: la data limite è calcolata in client.

alter table public.subscriptions
  add column if not exists planned_end_date date,
  add column if not exists cancellation_notice_days int;

alter table public.subscriptions
  add constraint subscriptions_notice_requires_end
    check (cancellation_notice_days is null or planned_end_date is not null);

alter table public.subscriptions
  add constraint subscriptions_notice_range
    check (cancellation_notice_days is null
           or (cancellation_notice_days >= 0 and cancellation_notice_days <= 365));

create index if not exists subscriptions_planned_end_idx
  on public.subscriptions(planned_end_date)
  where planned_end_date is not null;
