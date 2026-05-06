import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Chip } from '../components/ui'
import { useFamily } from '../hooks/useFamily'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard'
import { SubscriptionForm } from '../components/subscriptions/SubscriptionForm'
import { monthlyEquivalent } from '../lib/subscriptionMeta'
import { formatCurrency } from '../lib/format'
import type { Subscription } from '../types'

const MONTH_NAMES = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

export default function Subscriptions() {
  const { family, loading: famLoading } = useFamily()
  const { subscriptions, loading, refresh } = useSubscriptions()
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [creating, setCreating] = useState(false)

  const { active, paused, cancelled } = useMemo(() => {
    const out: Record<'active' | 'paused' | 'cancelled', Subscription[]> = {
      active: [],
      paused: [],
      cancelled: [],
    }
    for (const s of subscriptions) out[s.status].push(s)
    return out
  }, [subscriptions])

  const monthTotal = useMemo(
    () =>
      active.reduce(
        (acc, s) => acc + monthlyEquivalent(Number(s.amount) || 0, s.billing_cycle),
        0,
      ),
    [active],
  )

  const yearTotal = monthTotal * 12
  const monthLabel = MONTH_NAMES[new Date().getMonth()]

  if (famLoading) return null

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
        <Button size="sm" onClick={() => setCreating(true)} disabled={!family}>
          + Nuovo
        </Button>
      </div>

      {!family && !famLoading && (
        <Card variant="surface" padding="lg" className="mt-6 text-center">
          <p className="text-sm text-ink-soft">
            Per tracciare gli abbonamenti condivisi crea o unisciti a una
            famiglia.
          </p>
          <div className="mt-3">
            <Link to="/famiglia">
              <Button size="sm">Configura nucleo</Button>
            </Link>
          </div>
        </Card>
      )}

      {family && (
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
      )}

      {family && loading && (
        <div className="mt-8 text-center text-sm text-ink-soft">
          Caricamento…
        </div>
      )}

      {family && !loading && subscriptions.length === 0 && (
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

      {family && !loading && active.length > 0 && (
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
                onClick={() => setEditing(s)}
              />
            ))}
          </div>
        </section>
      )}

      {family && paused.length > 0 && (
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
                onClick={() => setEditing(s)}
              />
            ))}
          </div>
        </section>
      )}

      {family && cancelled.length > 0 && (
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
                onClick={() => setEditing(s)}
              />
            ))}
          </div>
        </section>
      )}

      {family && (
        <SubscriptionForm
          open={creating || editing !== null}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={refresh}
          familyId={family.id}
          initial={editing}
        />
      )}
    </AppShell>
  )
}
