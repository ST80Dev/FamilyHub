-- Phase 2: i pet diventano "componenti del nucleo" come persone, con icona avatar
--
-- Aggiunge a persons:
--  - kind ('human' | 'pet'): default 'human'; i pet sono persone non umane
--  - species: per i pet (cane, gatto, ecc.)
--  - avatar_emoji: emoji presentazionale (👤, 🐶, ...)
--
-- La tabella pets pre-esistente resta per back-compat (FK da deadlines/
-- home_maintenance puntano ancora là). Il selettore "Per chi?" delle scadenze
-- userà persons.person_id come fonte unica per umani e animali.

create type person_kind as enum ('human', 'pet');

alter table public.persons
  add column kind person_kind not null default 'human',
  add column species text,
  add column avatar_emoji text;

create index persons_kind_idx on public.persons(kind);
