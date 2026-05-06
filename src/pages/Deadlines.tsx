import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card } from '../components/ui'
import { useFamily } from '../hooks/useFamily'
import { useDeadlines } from '../hooks/useDeadlines'
import { DeadlineCard } from '../components/deadlines/DeadlineCard'
import { DeadlineForm } from '../components/deadlines/DeadlineForm'
import { urgencyBucket } from '../lib/deadlineEngine'
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

  if (famLoading) return null

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
        <Button
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!family}
        >
          + Nuova
        </Button>
      </div>

      {!family && !famLoading && (
        <Card variant="surface" padding="lg" className="mt-6 text-center">
          <p className="text-sm text-ink-soft">
            Per tracciare scadenze condivise crea o unisciti a una famiglia.
          </p>
          <div className="mt-3">
            <Link to="/famiglia">
              <Button size="sm">Configura nucleo</Button>
            </Link>
          </div>
        </Card>
      )}

      {family && loading && (
        <div className="mt-8 text-center text-sm text-ink-soft">Caricamento…</div>
      )}

      {family && !loading && deadlines.length === 0 && (
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

      {family && !loading && deadlines.length > 0 && (
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

      {family && (
        <DeadlineForm
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
