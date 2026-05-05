# FamilyHub

PWA React per la gestione condivisa di scadenze, abbonamenti e promemoria
economici per nuclei familiari italiani. L'utente inserisce i dati una volta sola
e riceve notifiche proattive prima che le cose scadano o costino soldi per
dimenticanza.

## Stack tecnico

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage)
- **PWA**: `vite-plugin-pwa` con Workbox (service worker, offline cache,
  notifiche push)
- **Routing**: `react-router-dom` v7
- **Deploy**: VPS OVH (da configurare)
- **Package manager**: npm

## Setup

```bash
cp .env.example .env
# inserisci VITE_SUPABASE_ANON_KEY (publishable key dal dashboard Supabase)
npm install
npm run dev
```

Variabili ambiente richieste:

```
VITE_SUPABASE_URL=https://nsrjhhwtfkcnkwgtffpm.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable o anon key>
```

Script:

- `npm run dev` — dev server
- `npm run build` — build di produzione
- `npm run preview` — preview del build
- `npm run typecheck` — solo type-check
- `npm run lint` — eslint

## Progetto Supabase

- ID progetto: `nsrjhhwtfkcnkwgtffpm`
- Region: `eu-west-1`
- URL: `https://nsrjhhwtfkcnkwgtffpm.supabase.co`

## Struttura dati

### Tabelle core

- **families** — nucleo familiare; ogni famiglia ha un `invite_code`
  univoco (8 caratteri) generato automaticamente
- **family_members** — utenti che fanno parte di una famiglia con `role`
  (`owner` | `member`); creato automaticamente per il creatore di una nuova
  famiglia tramite trigger
- **persons** — anagrafiche dei membri (anche minori, anche non utenti)
- **vehicles** — auto, moto, altri veicoli associabili a una persona
- **pets** — animali domestici

### Categorie

- **deadlines** — scadenze burocratiche (bollo, revisione, patente, CIE,
  passaporto, SPID, esenzione ticket, IMU, TARI, F24, dichiarazione redditi,
  assicurazioni, contratti, custom)
- **subscriptions** — abbonamenti ricorrenti (streaming, telefonia, palestra,
  ecc.) con `billing_cycle` (`monthly|quarterly|semiannual|annual`)
- **warranties** — garanzie prodotti; `expiry_date` calcolata via trigger
  da `purchase_date + warranty_months + extended_warranty_months`
- **vouchers** — buoni regalo, rimborsi, resi, cashback, coupon
- **home_maintenance** — manutenzioni casa/veicoli/animali con intervalli
  in mesi o in km

### Row Level Security

Tutte le tabelle hanno RLS abilitato. Pattern:

- Helper `public.is_family_member(family_id)` e `public.is_family_owner(family_id)`,
  entrambi `SECURITY DEFINER` per evitare ricorsione RLS
- Le tabelle figlie usano: `using (is_family_member(family_id))` su tutte
  le operazioni
- `families`: select per membri, insert per autenticati, update/delete solo
  owner. Il trigger `add_creator_as_owner` aggiunge l'utente che inserisce
  come `owner` in `family_members`
- `family_members`: select per membri stessa famiglia; insert/update/delete
  consentito sull'utente stesso oppure dall'owner
- RPC `join_family_by_code(code, name)` per joinare una famiglia tramite
  codice invito

### Migrazioni

In `supabase/migrations/`:

- `20260505140000_init_core.sql` — enums, helpers, families, family_members, RLS
- `20260505140100_init_entities.sql` — persons, vehicles, pets + RLS
- `20260505140200_init_records.sql` — deadlines, subscriptions, warranties,
  vouchers, home_maintenance + RLS

Applicate al progetto remoto via Supabase MCP. Per rigenerare i tipi TS:

```bash
npx supabase gen types typescript --project-id nsrjhhwtfkcnkwgtffpm > src/types/database.ts
```

## Struttura cartelle frontend

```
src/
  components/
    layout/        # AppShell, Sidebar, BottomNav
    ui/            # Button, Card, Badge, Modal, Form
    deadlines/  subscriptions/  warranties/
    vouchers/   maintenance/    family/
  pages/
    Dashboard.tsx       # timeline 60 giorni + abbonamenti del mese
    Deadlines.tsx
    Subscriptions.tsx
    Warranties.tsx
    Vouchers.tsx
    Maintenance.tsx
    Family.tsx          # gestione nucleo + inviti
    Settings.tsx
  hooks/
    useFamily.ts
    useDeadlines.ts ...
  lib/
    supabase.ts         # client Supabase
    deadlineEngine.ts   # logica calcolo scadenze italiane
    format.ts           # formattatori it-IT (date, valuta)
    notifications.ts
  types/
    database.ts         # generato da Supabase
    index.ts            # re-export tipi entità
```

## `deadlineEngine.ts` — logica italiana

Funzioni pure per calcolare le scadenze burocratiche italiane:

| Funzione                  | Regola                                                           |
| ------------------------- | ---------------------------------------------------------------- |
| `patenteExpiry`           | +10 anni; +5 se età >= 50; +3 se età >= 70 (alla data rilascio)  |
| `cieExpiry`               | +10 adulto, +5 se 3-17 anni, +3 se < 3 anni                      |
| `passaportoExpiry`        | +10 adulto, +5 minore                                            |
| `spidExpiry`              | Aruba +3 anni, Poste/TIM nessuna scadenza                        |
| `esenzioneTicketExpiry`   | prossimo 31 marzo                                                |
| `bolloAutoExpiry`         | ultimo giorno del mese di immatricolazione + 1 anno              |
| `revisioneAutoExpiry`     | prima a 4 anni, poi ogni 2                                       |
| `assicurazioneAnnualExpiry` | annuale dalla data stipula                                     |
| `imuNextDueDate`          | acconto 16 giugno, saldo 16 dicembre                             |
| `redditi730DueDate`       | 30 settembre                                                     |
| `warrantyExpiry`          | +24 mesi (Codice del Consumo), + extended_warranty_months        |
| `nextBillingDate`         | next billing per ciclo monthly/quarterly/semiannual/annual       |
| `urgencyBucket`           | overdue / within7 / within30 / within60 / later                  |

## Dashboard

Home: timeline degli oggetti in scadenza nei prossimi 60 giorni, raggruppati
per urgenza (🔴 7gg, 🟡 30gg, 🟢 60gg). Sotto: somma abbonamenti del mese
corrente.

## UX italiana

- Lingua italiana ovunque (UI, errori, validazioni)
- Date `DD/MM/YYYY` (`Intl.DateTimeFormat('it-IT')`)
- Valuta `€` formato italiano (`Intl.NumberFormat('it-IT')`)
- Mobile-first, bottom nav su mobile, sidebar su desktop
- Tema chiaro di default, dark mode supportata via `dark:` Tailwind
- Onboarding guidato: crea famiglia → aggiungi persone/veicoli → il sistema
  suggerisce le scadenze da inserire

## Convenzioni di sviluppo

- Le date in DB sono `date` (Postgres) e `string` ISO `YYYY-MM-DD` in TS;
  conversione/formattazione fatta solo nel layer di presentazione tramite
  `lib/format.ts`
- Nessun valore monetario in `number` JavaScript per arrotondamenti critici:
  usare `numeric(12,2)` lato DB; in TS preferire `string` per importi se
  arrivano da DB e formattarli con `formatCurrency`
- Tutti i nuovi tipi enum vanno aggiunti prima al DB (migration), poi
  rigenerare `src/types/database.ts`
- Ogni nuova tabella deve essere creata con `RLS enabled` e policy basate su
  `is_family_member(family_id)`
- I componenti UI per categoria stanno in `src/components/<categoria>/`,
  le pagine in `src/pages/`
