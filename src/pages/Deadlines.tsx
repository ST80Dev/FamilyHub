import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { useDeadlines } from '../hooks/useDeadlines'
import { DeadlineCard } from '../components/deadlines/DeadlineCard'
import { DeadlineForm } from '../components/deadlines/DeadlineForm'
import { urgencyBucket } from '../lib/deadlineEngine'
import { recordOwnership } from '../lib/ownership'
import type { Deadline } from '../types'

type Group = 'overdue' | 'within7' | 'within30' | 'within60' | 'later'

const GROUP_LABEL: Record<Group, string> = {
  overdue: 'In ritardo',
  within7: 'Entro 7 giorni',
  within30: 'Entro 30 giorni',
  within60: 'Entro 60 giorni',
  later: 'Più avanti',
}

const GROUP_ORDER: Group[] = ['overdue', 'within7', 'within30', 'within60', 'later']

export default function Deadlines() {
  const { user } = useAuth()
  const { family, loading: famLoading } = useFamily()
  const { deadlines, loading, refresh } = useDeadlines()
  const [editing, setEditing] = useState<Deadline | null>(null)
  const [creating, setCreating] = useState(false)

  const grouped = useMemo(() => {
    const out: Record<Group, Deadline[]> = {
      overdue: [],
      within7: [],
      within30: [],
      within60: [],
      later: [],
    }
    for (const d of deadlines) {
      if (d.status === 'done') continue
      const u = urgencyBucket(d.due_date)
      out[u as Group].push(d)
    }
    return out
  }, [deadlines])

  if (famLoading || !user) return null

  const scope = recordOwnership(family, user.id)

  return (
    <AppShell>
      <div className="flex items-center justify-between md:mt-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Scadenze
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {deadlines.length === 0
              ? 'Nessuna scadenza tracciata'
              : `${deadlines.length} ${deadlines.length === 1 ? 'scadenza' : 'scadenze'}`}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          + Nuova
        </Button>
      </div>

      {!family && (
        <Card variant="surface" padding="md" className="mt-4">
          <p className="text-sm text-ink-soft">
            Stai usando FamilyHub da solo. Le scadenze che aggiungi sono tue.{' '}
            <Link to="/famiglia" className="font-semibold text-ink underline">
              Crea o unisciti a una famiglia
            </Link>{' '}
            per condividerle col nucleo.
          </p>
        </Card>
      )}

      {loading && (
        <div className="mt-8 text-center text-sm text-ink-soft">Caricamento…</div>
      )}

      {!loading && deadlines.length === 0 && (
        <Card variant="surface" padding="lg" className="mt-6 text-center">
          <div className="mb-3 text-4xl" aria-hidden>
            📅
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            Inizia da una scadenza
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Bollo, patente, IMU, assicurazione… aggiungile man mano.
          </p>
          <div className="mt-4">
            <Button size="sm" onClick={() => setCreating(true)}>
              + Aggiungi scadenza
            </Button>
          </div>
        </Card>
      )}

      {!loading && deadlines.length > 0 && (
        <div className="mt-6 space-y-6">
          {GROUP_ORDER.map((g) => {
            const items = grouped[g]
            if (items.length === 0) return null
            return (
              <section key={g}>
                <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
                  {GROUP_LABEL[g]}{' '}
                  <span className="text-sm font-medium text-ink-soft">
                    · {items.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {items.map((d) => (
                    <DeadlineCard
                      key={d.id}
                      deadline={d}
                      onClick={() => setEditing(d)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <DeadlineForm
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={refresh}
        scope={scope}
        initial={editing}
      />
    </AppShell>
  )
}
