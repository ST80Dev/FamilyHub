import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Chip } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { usePersons } from '../hooks/usePersons'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard'
import { SubscriptionForm } from '../components/subscriptions/SubscriptionForm'
import { effectiveMonthlyAmount } from '../lib/subscriptionForecast'
import { todayISO } from '../lib/deadlineEngine'
import { formatCurrency } from '../lib/format'
import { recordOwnership } from '../lib/ownership'
import type { Subscription } from '../types'

const MONTH_NAMES = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

export default function Subscriptions() {
  const { user } = useAuth()
  const { family, loading: famLoading } = useFamily()
  const { subscriptions, loading, refresh } = useSubscriptions()
  const { persons } = usePersons()
  const personById = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons],
  )
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [creating, setCreating] = useState(false)
  const [duplicating, setDuplicating] = useState<Subscription | null>(null)

  const { active, paused, cancelled } = useMemo(() => {
    const out: Record<'active' | 'paused' | 'cancelled', Subscription[]> = {
      active: [],
      paused: [],
      cancelled: [],
    }
    for (const s of subscriptions) out[s.status].push(s)
    return out
  }, [subscriptions])

  const today = todayISO()
  const monthTotal = useMemo(
    () => active.reduce((acc, s) => acc + effectiveMonthlyAmount(s, today), 0),
    [active, today],
  )

  const yearTotal = monthTotal * 12
  const monthLabel = MONTH_NAMES[new Date().getMonth()]

  if (famLoading || !user) return null

  const scope = recordOwnership(family, user.id)

  return (
    <AppShell>
      <div className="flex items-center justify-between md:mt-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Abbonamenti
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {active.length === 0
              ? 'Nessun abbonamento attivo'
              : `${active.length} ${active.length === 1 ? 'attivo' : 'attivi'}`}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          + Nuovo
        </Button>
      </div>

      {!family && (
        <Card variant="surface" padding="md" className="mt-4">
          <p className="text-sm text-ink-soft">
            Stai usando FamilyHub da solo. Gli abbonamenti che aggiungi sono tuoi.{' '}
            <Link to="/famiglia" className="font-semibold text-ink underline">
              Crea o unisciti a una famiglia
            </Link>{' '}
            per condividerli col nucleo.
          </p>
        </Card>
      )}

      <Card variant="hero" padding="lg" radius="xl" className="mt-5">
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-80">
            Spesa mensile · {monthLabel}
          </div>
          <div className="font-display mt-1 text-[42px] font-bold leading-none">
            {formatCurrency(monthTotal)}{' '}
            <small className="text-sm font-medium opacity-70">/ mese</small>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip glass dotColor="var(--candy-peach-2)">
              {active.length}{' '}
              {active.length === 1 ? 'attivo' : 'attivi'}
            </Chip>
            <Chip glass>
              proiezione anno: {formatCurrency(yearTotal)}
            </Chip>
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

      {loading && (
        <div className="mt-8 text-center text-sm text-ink-soft">
          Caricamento…
        </div>
      )}

      {!loading && subscriptions.length === 0 && (
        <Card variant="surface" padding="lg" className="mt-6 text-center">
          <div className="mb-3 text-4xl" aria-hidden>💳</div>
          <h2 className="font-display text-xl font-bold text-ink">
            Nessun abbonamento ancora
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Streaming, telefonia, palestra: aggiungili man mano per vedere la
            spesa mensile e il prossimo addebito.
          </p>
          <div className="mt-4">
            <Button size="sm" onClick={() => setCreating(true)}>
              + Aggiungi abbonamento
            </Button>
          </div>
        </Card>
      )}

      {!loading && active.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
            Attivi{' '}
            <span className="text-sm font-medium text-ink-soft">
              · {active.length}
            </span>
          </h2>
          <div className="space-y-3">
            {active.map((s) => (
              <SubscriptionCard
                key={s.id}
                subscription={s}
                person={s.person_id ? personById.get(s.person_id) : null}
                onClick={() => setEditing(s)}
              />
            ))}
          </div>
        </section>
      )}

      {paused.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
            In pausa{' '}
            <span className="text-sm font-medium text-ink-soft">
              · {paused.length}
            </span>
          </h2>
          <div className="space-y-3">
            {paused.map((s) => (
              <SubscriptionCard
                key={s.id}
                subscription={s}
                person={s.person_id ? personById.get(s.person_id) : null}
                onClick={() => setEditing(s)}
              />
            ))}
          </div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
            Cancellati{' '}
            <span className="text-sm font-medium text-ink-soft">
              · {cancelled.length}
            </span>
          </h2>
          <div className="space-y-3 opacity-60">
            {cancelled.map((s) => (
              <SubscriptionCard
                key={s.id}
                subscription={s}
                person={s.person_id ? personById.get(s.person_id) : null}
                onClick={() => setEditing(s)}
              />
            ))}
          </div>
        </section>
      )}

      <SubscriptionForm
        open={creating || editing !== null || duplicating !== null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
          setDuplicating(null)
        }}
        onSaved={refresh}
        scope={scope}
        initial={editing}
        duplicateFrom={duplicating}
        onDuplicate={(s) => {
          setEditing(null)
          setCreating(false)
          setDuplicating(s)
        }}
      />
    </AppShell>
  )
}
