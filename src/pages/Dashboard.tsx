import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Chip } from '../components/ui'
import { useFamily } from '../hooks/useFamily'
import { useDeadlines } from '../hooks/useDeadlines'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { DeadlineCard } from '../components/deadlines/DeadlineCard'
import { useAuth } from '../hooks/useAuth'
import {
  daysUntil,
  nextBillingDate,
  todayISO,
  urgencyBucket,
} from '../lib/deadlineEngine'
import { formatCurrency, formatDate } from '../lib/format'
import type { Subscription } from '../types'

const SUB_CARD_TONES = [
  'candy-peach',
  'candy-mint',
  'candy-sky',
  'candy-lemon',
  'candy-lilac',
  'candy-pink',
] as const

const MONTH_NAMES = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

function monthlyAmount(s: Subscription): number {
  const amount = Number(s.amount) || 0
  switch (s.billing_cycle) {
    case 'monthly': return amount
    case 'quarterly': return amount / 3
    case 'semiannual': return amount / 6
    case 'annual': return amount / 12
  }
}

function ensureNextBilling(s: Subscription): string | null {
  if (s.next_billing_date) {
    const d = daysUntil(s.next_billing_date)
    if (d >= 0) return s.next_billing_date
    return nextBillingDate(s.next_billing_date, s.billing_cycle)
  }
  return null
}

function firstName(input?: string | null): string {
  if (!input) return ''
  const trimmed = input.trim().split(/[\s@]/)[0] ?? ''
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export default function Dashboard() {
  const { user } = useAuth()
  const { family, membership, loading: famLoading } = useFamily()
  const { deadlines, loading: dlLoading } = useDeadlines()
  const { subscriptions: allSubs, loading: subLoading } = useSubscriptions()
  const subscriptions = useMemo(
    () => allSubs.filter((s) => s.status === 'active'),
    [allSubs],
  )

  const upcoming = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (d.status === 'done') return false
        const u = urgencyBucket(d.due_date)
        return u !== 'later'
      })
      .slice(0, 4)
  }, [deadlines])

  const urgencyCounts = useMemo(() => {
    const out = { red: 0, yellow: 0, green: 0 }
    for (const d of deadlines) {
      if (d.status === 'done') continue
      const u = urgencyBucket(d.due_date)
      if (u === 'overdue' || u === 'within7') out.red++
      else if (u === 'within30') out.yellow++
      else if (u === 'within60') out.green++
    }
    return out
  }, [deadlines])

  const monthTotal = useMemo(
    () => subscriptions.reduce((acc, s) => acc + monthlyAmount(s), 0),
    [subscriptions],
  )

  const nextSub = useMemo(() => {
    const today = todayISO()
    return [...subscriptions]
      .map((s) => ({ s, next: ensureNextBilling(s) }))
      .filter((x): x is { s: Subscription; next: string } => x.next !== null)
      .sort(
        (a, b) => daysUntil(a.next, today) - daysUntil(b.next, today),
      )[0]
  }, [subscriptions])

  const greetName =
    firstName(membership?.display_name) || firstName(user?.email) || 'ciao'
  const monthLabel = MONTH_NAMES[new Date().getMonth()]
  const totalUpcoming = urgencyCounts.red + urgencyCounts.yellow + urgencyCounts.green

  return (
    <AppShell>
      <section className="mt-2 px-1">
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink">
          Buongiorno, {greetName}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {totalUpcoming === 0
            ? 'Niente in scadenza nei prossimi 60 giorni'
            : `${totalUpcoming} ${totalUpcoming === 1 ? 'cosa da tenere d’occhio' : 'cose da tenere d’occhio'} nei prossimi 60 giorni`}
        </p>
      </section>

      {!family && !famLoading && (
        <Card variant="surface" padding="lg" className="mt-5">
          <h3 className="font-display text-lg font-bold text-ink">
            Stai usando FamilyHub da solo
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Crea una famiglia o unisciti a una esistente per condividere scadenze
            e abbonamenti col resto del nucleo.
          </p>
          <div className="mt-3">
            <Link to="/famiglia">
              <Button size="sm">Configura nucleo</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Hero abbonamenti */}
      <Card variant="hero" padding="lg" radius="xl" className="mt-5">
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-80">
            Abbonamenti · {monthLabel}
          </div>
          <div className="font-display mt-1 text-[42px] font-bold leading-none">
            {formatCurrency(monthTotal)}{' '}
            <small className="text-sm font-medium opacity-70">/ mese</small>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip glass dotColor="var(--candy-peach-2)">
              {subscriptions.length}{' '}
              {subscriptions.length === 1 ? 'attivo' : 'attivi'}
            </Chip>
            {nextSub && (
              <Chip glass>
                prossimo: {nextSub.s.name} · {formatDate(nextSub.next)}
              </Chip>
            )}
          </div>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -left-5 h-24 w-24 rounded-full bg-white/25"
        />
      </Card>

      {/* Urgenza */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Card variant="urg-red" padding="md" radius="lg" className="text-center">
          <div className="font-display text-3xl font-bold leading-none">
            {urgencyCounts.red}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider opacity-95">
            entro 7 gg
          </div>
        </Card>
        <Card variant="urg-yellow" padding="md" radius="lg" className="text-center">
          <div className="font-display text-3xl font-bold leading-none">
            {urgencyCounts.yellow}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider opacity-75">
            entro 30 gg
          </div>
        </Card>
        <Card variant="urg-green" padding="md" radius="lg" className="text-center">
          <div className="font-display text-3xl font-bold leading-none">
            {urgencyCounts.green}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider opacity-75">
            entro 60 gg
          </div>
        </Card>
      </div>

      {/* In arrivo */}
      <section className="mt-6">
        <header className="flex items-center justify-between px-1">
          <h2 className="font-display text-xl font-bold text-ink">In arrivo</h2>
          <Link
            to="/scadenze"
            className="rounded-full bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-ink-soft clay-sm hover:text-ink"
          >
            vedi tutto
          </Link>
        </header>
        <div className="mt-3 space-y-3">
          {dlLoading && (
            <div className="text-center text-sm text-ink-soft">Caricamento…</div>
          )}
          {!dlLoading && upcoming.length === 0 && family && (
            <Card variant="surface" padding="lg" className="text-center">
              <p className="text-sm text-ink-soft">
                Tutto in ordine, nessuna scadenza nei prossimi 60 giorni.
              </p>
              <div className="mt-3">
                <Link to="/scadenze">
                  <Button size="sm" variant="secondary">
                    Aggiungi scadenza
                  </Button>
                </Link>
              </div>
            </Card>
          )}
          {upcoming.map((d) => (
            <DeadlineCard key={d.id} deadline={d} />
          ))}
        </div>
      </section>

      {/* Abbonamenti */}
      {subscriptions.length > 0 && (
        <section className="mt-7">
          <header className="flex items-center justify-between px-1">
            <h2 className="font-display text-xl font-bold text-ink">
              Abbonamenti
            </h2>
            <Link
              to="/abbonamenti"
              className="rounded-full bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-ink-soft clay-sm hover:text-ink"
            >
              gestisci
            </Link>
          </header>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {subscriptions.slice(0, 4).map((s, i) => {
              const next = ensureNextBilling(s)
              return (
                <Link key={s.id} to="/abbonamenti" className="block">
                  <Card
                    variant={SUB_CARD_TONES[i % SUB_CARD_TONES.length]}
                    padding="md"
                    radius="lg"
                  >
                    <div className="text-sm font-bold leading-tight">{s.name}</div>
                    <div className="font-display mt-1 text-xl font-bold leading-none">
                      {formatCurrency(s.amount, s.currency)}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold opacity-80">
                      {next ? `addebito · ${formatDate(next)}` : s.billing_cycle}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {family && subscriptions.length === 0 && !subLoading && (
        <section className="mt-7">
          <Card variant="surface" padding="lg" className="text-center">
            <div className="text-3xl" aria-hidden>💳</div>
            <h3 className="font-display mt-2 text-lg font-bold text-ink">
              Nessun abbonamento
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Quando li aggiungi vedrai qui la spesa mensile e il prossimo
              addebito.
            </p>
            <div className="mt-3">
              <Link to="/abbonamenti">
                <Button size="sm" variant="secondary">
                  Aggiungi abbonamento
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}
    </AppShell>
  )
}
