import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Chip } from '../components/ui'
import { useFamily } from '../hooks/useFamily'
import { useDeadlines } from '../hooks/useDeadlines'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useVouchers } from '../hooks/useVouchers'
import { usePersons } from '../hooks/usePersons'
import { DeadlineCard } from '../components/deadlines/DeadlineCard'
import { PostponeDeadlineModal } from '../components/deadlines/PostponeDeadlineModal'
import { VoucherCard } from '../components/vouchers/VoucherCard'
import { WeeklyExpenses } from '../components/payment/WeeklyExpenses'
import { useAuth } from '../hooks/useAuth'
import {
  daysUntil,
  nextBillingDate,
  todayISO,
  urgencyBucket,
} from '../lib/deadlineEngine'
import {
  cancellationStatus,
  effectiveMonthlyAmount,
} from '../lib/subscriptionForecast'
import { formatCurrency, formatDate } from '../lib/format'
import type { Deadline, Subscription } from '../types'

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
  const { deadlines, loading: dlLoading, refresh: refreshDeadlines } = useDeadlines()
  const { subscriptions: allSubs, loading: subLoading } = useSubscriptions()
  const { vouchers, refresh: refreshVouchers } = useVouchers()
  const { persons } = usePersons()
  const [postponing, setPostponing] = useState<Deadline | null>(null)
  const personById = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons],
  )
  const selfPerson = useMemo(
    () => persons.find((p) => p.linked_user_id === user?.id) ?? null,
    [persons, user?.id],
  )
  const subscriptions = useMemo(
    () => allSubs.filter((s) => s.status === 'active'),
    [allSubs],
  )

  const overdueDeadlines = useMemo(() => {
    return deadlines.filter((d) => {
      if (d.status === 'done') return false
      return urgencyBucket(d.due_date) === 'overdue'
    })
  }, [deadlines])

  const upcoming = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (d.status === 'done') return false
        const u = urgencyBucket(d.due_date)
        return u !== 'later' && u !== 'overdue'
      })
      .slice(0, 4)
  }, [deadlines])

  const urgencyCounts = useMemo(() => {
    const out = { red: 0, yellow: 0, green: 0 }
    for (const d of deadlines) {
      if (d.status === 'done') continue
      const u = urgencyBucket(d.due_date)
      if (u === 'within7') out.red++
      else if (u === 'within30') out.yellow++
      else if (u === 'within60') out.green++
    }
    return out
  }, [deadlines])

  const today = todayISO()
  const monthTotal = useMemo(
    () => subscriptions.reduce((acc, s) => acc + effectiveMonthlyAmount(s, today), 0),
    [subscriptions, today],
  )

  const expiringVouchers = useMemo(() => {
    return vouchers
      .filter((v) => {
        if (v.status !== 'available') return false
        if (!v.expiry_date) return false
        const u = urgencyBucket(v.expiry_date)
        return u !== 'later' && u !== 'overdue'
      })
      .sort((a, b) => {
        if (!a.expiry_date) return 1
        if (!b.expiry_date) return -1
        return a.expiry_date.localeCompare(b.expiry_date)
      })
      .slice(0, 3)
  }, [vouchers])

  const expiredVouchers = useMemo(() => {
    return vouchers
      .filter((v) => {
        if (v.status === 'used') return false
        if (v.status === 'expired') return true
        if (!v.expiry_date) return false
        return daysUntil(v.expiry_date) < 0
      })
  }, [vouchers])

  const overdueTotal = overdueDeadlines.length + expiredVouchers.length

  const cancellationAlerts = useMemo(() => {
    const items: { sub: Subscription; alertDate: string; daysToNotice: number }[] = []
    for (const s of subscriptions) {
      const c = cancellationStatus(s, today, 60)
      if (c.kind === 'urgent' || c.kind === 'overdue_notice') {
        items.push({
          sub: s,
          alertDate: c.noticeDate,
          daysToNotice: c.kind === 'overdue_notice' ? -1 : c.daysToNotice,
        })
      }
    }
    items.sort((a, b) => a.daysToNotice - b.daysToNotice)
    return items
  }, [subscriptions, today])

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
    firstName(selfPerson?.display_name) ||
    firstName(membership?.display_name) ||
    firstName(user?.email) ||
    'ciao'
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

      {/* In ritardo — banner in evidenza */}
      {overdueTotal > 0 && (
        <section className="mt-5">
          <Card variant="urg-red" padding="lg" radius="xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-90">
                  In ritardo
                </div>
                <div className="font-display mt-1 text-2xl font-bold leading-tight">
                  {overdueTotal}{' '}
                  {overdueTotal === 1 ? 'cosa passata' : 'cose passate'}
                </div>
                <p className="mt-1.5 text-xs leading-snug opacity-90">
                  {overdueDeadlines.length > 0 && (
                    <>
                      {overdueDeadlines.length}{' '}
                      {overdueDeadlines.length === 1 ? 'scadenza' : 'scadenze'}
                    </>
                  )}
                  {overdueDeadlines.length > 0 && expiredVouchers.length > 0 && ' · '}
                  {expiredVouchers.length > 0 && (
                    <>
                      {expiredVouchers.length}{' '}
                      {expiredVouchers.length === 1 ? 'buono scaduto' : 'buoni scaduti'}
                    </>
                  )}
                </p>
              </div>
              <span className="text-3xl leading-none" aria-hidden>
                ⚠️
              </span>
            </div>
          </Card>

          {overdueDeadlines.length > 0 && (
            <div className="mt-3 space-y-3">
              {overdueDeadlines.slice(0, 3).map((d) => (
                <DeadlineCard
                  key={d.id}
                  deadline={d}
                  person={d.person_id ? personById.get(d.person_id) : null}
                  onPostpone={setPostponing}
                />
              ))}
              {overdueDeadlines.length > 3 && (
                <Link
                  to="/scadenze"
                  className="block rounded-full bg-[color:var(--surface-2)] px-3 py-2 text-center text-xs font-semibold text-ink-soft hover:text-ink"
                >
                  +{overdueDeadlines.length - 3} altre scadenze in ritardo →
                </Link>
              )}
            </div>
          )}

          {expiredVouchers.length > 0 && overdueDeadlines.length === 0 && (
            <div className="mt-3">
              <Link
                to="/buoni"
                className="block rounded-full bg-[color:var(--surface-2)] px-3 py-2 text-center text-xs font-semibold text-ink-soft hover:text-ink"
              >
                Vedi buoni scaduti →
              </Link>
            </div>
          )}
        </section>
      )}

      {!family && !famLoading && (
        <Card variant="surface" padding="md" className="mt-5">
          <p className="text-sm text-ink-soft">
            Stai usando FamilyHub da solo. Quando vuoi puoi{' '}
            <Link to="/famiglia" className="font-semibold text-ink underline">
              creare o unirti a una famiglia
            </Link>{' '}
            e condividere scadenze e abbonamenti.
          </p>
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

      <WeeklyExpenses />

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
          {!dlLoading && upcoming.length === 0 && (
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
            <DeadlineCard
              key={d.id}
              deadline={d}
              person={d.person_id ? personById.get(d.person_id) : null}
            />
          ))}
        </div>
      </section>

      {/* Buoni in scadenza */}
      {expiringVouchers.length > 0 && (
        <section className="mt-6">
          <header className="flex items-center justify-between px-1">
            <h2 className="font-display text-xl font-bold text-ink">
              Buoni in scadenza
            </h2>
            <Link
              to="/buoni"
              className="rounded-full bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-ink-soft clay-sm hover:text-ink"
            >
              vedi tutto
            </Link>
          </header>
          <div className="mt-3 space-y-3">
            {expiringVouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                person={v.person_id ? personById.get(v.person_id) : null}
                onChanged={refreshVouchers}
              />
            ))}
          </div>
        </section>
      )}

      {/* Disdette da gestire */}
      {cancellationAlerts.length > 0 && (
        <section className="mt-6">
          <header className="flex items-center justify-between px-1">
            <h2 className="font-display text-xl font-bold text-ink">
              Da disdire
            </h2>
          </header>
          <div className="mt-3 space-y-2">
            {cancellationAlerts.map(({ sub, alertDate, daysToNotice }) => (
              <Link key={sub.id} to="/abbonamenti" className="block">
                <Card
                  variant="surface"
                  padding="sm"
                  radius="lg"
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold leading-tight text-ink">
                      {sub.name}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-soft">
                      Disdici entro {formatDate(alertDate)}
                      {sub.planned_end_date &&
                        ` · stop ${formatDate(sub.planned_end_date)}`}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      daysToNotice < 0
                        ? 'candy-red-grad text-white'
                        : 'candy-lemon-grad text-[color:var(--candy-ink)]'
                    }`}
                  >
                    {daysToNotice < 0
                      ? 'subito'
                      : `tra ${daysToNotice} gg`}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {subscriptions.length === 0 && !subLoading && (
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

      <PostponeDeadlineModal
        open={postponing !== null}
        deadline={postponing}
        onClose={() => setPostponing(null)}
        onSaved={refreshDeadlines}
      />
    </AppShell>
  )
}
