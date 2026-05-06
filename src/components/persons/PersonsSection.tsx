import { useState } from 'react'
import { Button, Card } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import { useFamily } from '../../hooks/useFamily'
import { usePersons } from '../../hooks/usePersons'
import { recordOwnership } from '../../lib/ownership'
import { PERSON_KIND_LABEL, personAvatar } from '../../lib/personMeta'
import { PersonForm } from './PersonForm'
import type { Person } from '../../types'

export function PersonsSection() {
  const { user } = useAuth()
  const { family } = useFamily()
  const { persons, loading, refresh } = usePersons()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)

  if (!user) return null
  const scope = recordOwnership(family, user.id)

  return (
    <Card variant="surface" padding="lg" radius="xl" className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Componenti del nucleo
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Persone e animali a cui associare scadenze (anche minori o non
            registrati).
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
          + Nuovo
        </Button>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-ink-soft">Caricamento…</div>
      )}

      {!loading && persons.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          Nessun componente. Aggiungi te stesso, un familiare o un animale.
        </p>
      )}

      {!loading && persons.length > 0 && (
        <ul className="mt-4 space-y-2">
          {persons.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setEditing(p)}
                className="flex w-full items-center gap-3 rounded-2xl bg-[color:var(--surface-2)] px-3 py-2.5 text-left clay-sm transition hover:scale-[1.01]"
              >
                <span className="text-2xl" aria-hidden>
                  {personAvatar(p)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink">
                    {p.display_name}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-ink-soft">
                    {PERSON_KIND_LABEL[p.kind]}
                    {p.species ? ` · ${p.species}` : ''}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <PersonForm
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={refresh}
        scope={scope}
        initial={editing}
      />
    </Card>
  )
}
