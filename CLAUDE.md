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
- **Deploy**: Vercel (frontend) + Supabase Cloud EU (backend) — vedi sezione
  "Deploy & infrastruttura" in fondo
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
- Le tabelle figlie supportano scope alternativi (`family_id` XOR `owner_user_id`):
  `using ((family_id is not null and is_family_member(family_id)) or owner_user_id = auth.uid())`
- `families`: select per membri, insert per autenticati, update/delete solo
  owner. Il trigger `add_creator_as_owner` aggiunge l'utente che inserisce
  come `owner` in `family_members`
- `family_members`: select per membri stessa famiglia; insert/update/delete
  consentito sull'utente stesso oppure dall'owner
- RPC `join_family_by_code(code, name)` per joinare una famiglia tramite
  codice invito
- RPC `promote_personal_to_family(target_family, categories?)` per spostare
  i record personali dell'utente corrente in una famiglia (usato dopo create/join)

### Modello di proprietà dei record

Ogni record nelle tabelle dati (persons, vehicles, pets, deadlines, subscriptions,
warranties, vouchers, home_maintenance) appartiene **o** a una famiglia
(`family_id`) **o** a un singolo utente (`owner_user_id`), in mutua esclusione
forzata da CHECK constraint. Implicazioni:

- L'utente può usare l'app da solo: tutti i record che crea sono personali
  (`owner_user_id = auth.uid()`).
- Al create/join di una famiglia, la pagina `/famiglia` propone la promotion
  one-shot dei record personali nel nucleo via `promote_personal_to_family`.
- Trigger cross-scope (`*_check_scope`) impediscono che un record figlio
  riferisca un parent di scope diverso (es. una scadenza personale che punta
  a un veicolo familiare).
- L'helper TypeScript `lib/ownership.ts:recordOwnership(family, userId)`
  produce le colonne corrette da passare in insert.

**Fase 2 (futura)**: condivisione selettiva per categoria quando un utente
appartiene a più famiglie. Tabella aggiuntiva `personal_sharing(user_id,
family_id, category)` + estensione RLS sopra il modello attuale, senza
toccare le colonne esistenti.

### Migrazioni

In `supabase/migrations/`:

- `20260505140000_init_core.sql` — enums, helpers, families, family_members, RLS
- `20260505140100_init_entities.sql` — persons, vehicles, pets + RLS
- `20260505140200_init_records.sql` — deadlines, subscriptions, warranties,
  vouchers, home_maintenance + RLS
- `20260506100000_optional_family_ownership.sql` — `family_id` reso nullable
  su tutte e 8 le tabelle dati, aggiunta colonna `owner_user_id` con CHECK XOR,
  RLS riscritta per supportare record personali, trigger cross-scope sulle FK
  parent (persons/vehicles/pets), RPC `promote_personal_to_family` per spostare
  i record personali di un utente in una famiglia

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
- Onboarding non bloccante: l'utente può usare l'app anche senza creare/unirsi
  a una famiglia. Le pagine Scadenze/Abbonamenti/Dashboard restano pienamente
  funzionali in modalità solo-utente (i record creati sono `owner_user_id`).
  La gestione del nucleo (creazione, invito, join via codice) vive nella
  pagina `/famiglia` ed è raggiungibile in qualsiasi momento. La Dashboard e
  le pagine categoria mostrano un banner morbido "Stai usando FamilyHub da
  solo" con link a `/famiglia`, non bloccante.
- Al create/join di una famiglia, se l'utente ha record personali pendenti,
  la pagina `/famiglia` mostra un prompt one-shot "Condividere i record
  personali col nucleo?" con conteggio per categoria; al sì viene chiamata
  la RPC `promote_personal_to_family`.

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

## Workflow git e branching

- **Branch di default del repo**: `main` (impostato lato GitHub). Tutto il
  lavoro va aperto come PR contro `main`.
- **All'inizio di ogni nuova attività**, prima di toccare il codice:
  `git fetch origin --prune && git log origin/main --oneline -10` per vedere
  lo stato reale di `main` sul remoto.
- **Verificare se eventuali branch precedenti sono stati mergiati su `main`**
  (non su altri branch intermedi). Controllare i merge commit puntando a
  `origin/main`, non a branch ereditati.
- **Creare nuovi branch sempre da `origin/main` aggiornato**, mai da un
  branch ereditato dalla sessione precedente. Pattern:
  `git checkout -B <nuovo-branch> origin/main`.
- **Quando si apre una PR**: il target deve essere `main` (default branch).
  Verificare esplicitamente nel form PR e nella descrizione che la base sia
  `main` e non un altro branch di lavoro.
- **Dopo il merge**: il deploy di produzione su Vercel parte da `main`. Se
  una PR viene mergiata su un branch diverso, la produzione non si aggiorna
  e Claude/sviluppatore devono accorgersene controllando `origin/main`.

## Deploy & infrastruttura

### Setup attuale (fase familiare / sviluppo)

- **Frontend**: Vercel, account `st80dev`, progetto collegato al repo
  `ST80Dev/FamilyHub`. Auto-detect Vite, niente config nel repo oltre a
  `vercel.json` (SPA rewrite per il routing client-side della PWA).
  - Production URL: `https://family-hub-tan-xi.vercel.app`
  - Preview deploy automatici per ogni branch: `https://*-st80dev.vercel.app`
  - Env vars su dashboard Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Backend**: Supabase Cloud, progetto `nsrjhhwtfkcnkwgtffpm` (region
  `eu-west-1`). Auth, DB, Realtime, Storage gestiti.
- **Auth Configuration** (Supabase Dashboard → Authentication → URL Configuration):
  - Site URL: `https://family-hub-tan-xi.vercel.app`
  - Redirect URLs: `https://family-hub-tan-xi.vercel.app/**`,
    `https://*-st80dev.vercel.app/**` (per i preview deploy)
- **Dominio custom**: nessuno per ora. L'utente possiede `meteonow.app` ma
  non è coerente col progetto. Quando il branding sarà definitivo si comprerà
  un dominio dedicato; fino ad allora si usa la URL Vercel.

### Strategia di hosting (3 fasi)

| Fase | Frontend | Backend | Trigger di passaggio |
|---|---|---|---|
| **1 — Famiglia / sviluppo** (ora) | Vercel | Supabase Cloud EU | — |
| **2 — Famiglia + AI pesante** | Vercel | Supabase self-hosted su VPS OVH | Gmail OAuth full, uscita dal free tier, sovranità dati richiesta |
| **3 — Pubblicazione** | Vercel (o VPS) | Cloud per scalare, o self-hosted | Decisione di prodotto |

Lo stesso codebase serve tutte le fasi: cambia solo dove punta
`VITE_SUPABASE_URL`. Le migration in `supabase/migrations/` funzionano identiche
su Cloud e self-hosted.

### Regole per non pagare la migrazione futura

- Schema sempre via migration file in `supabase/migrations/`, mai modifiche
  manuali dal dashboard Cloud.
- Niente feature Cloud-only non versionate (pg_cron, Vault, scheduled functions
  vanno tutte in migration o `supabase/functions/`).
- Backup di sicurezza periodico (`supabase db dump` mensile) salvato fuori da
  Supabase, indipendente dal PITR del piano.
- Anon/service key sempre in env var, mai nel repo.

### Nota privacy fase familiare

Distribuzione attuale: solo familiari consapevoli, niente pubblicazione store.
GDPR copre il trattamento sotto eccezione domestica (art. 2.2.c). Vercel serve
solo asset statici e non vede dati personali. I dati personali transitano
direttamente browser → Supabase EU. Quando si valuterà la pubblicazione, le
feature più invasive (es. Gmail OAuth full) saranno riconsiderate o gateate
dietro consenso esplicito.
