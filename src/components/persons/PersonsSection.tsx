import { useMemo, useState } from 'react'
import { Button, Card } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import { useFamily } from '../../hooks/useFamily'
import { usePersons } from '../../hooks/usePersons'
import { PERSON_KIND_LABEL, personAvatar } from '../../lib/personMeta'
import { PersonForm } from './PersonForm'
import type { Person } from '../../types'

const SELF_AVATAR_DEFAULT = '👤'

function emailPrefix(email: string | null | undefined): string {
  if (!email) return 'Io'
  const at = email.indexOf('@')
  if (at <= 0) return email
  const raw = email.slice(0, at)
  // Capitalize first letter to feel more like a name
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function PersonsSection() {
  const { user } = useAuth()
  const { family, refresh: refreshFamily } = useFamily()
  const { persons, loading, refresh } = usePersons()
  const [creating, setCreating] = useState<'normal' | 'self' | null>(null)
  const [editing, setEditing] = useState<Person | null>(null)

  const selfPerson = useMemo(
    () => persons.find((p) => p.linked_user_id === user?.id) ?? null,
    [persons, user?.id],
  )
  const others = useMemo(
    () => persons.filter((p) => p.id !== selfPerson?.id),
    [persons, selfPerson?.id],
  )

  if (!user) return null

  const selfDisplayName = selfPerson?.display_name ?? emailPrefix(user.email)
  const selfAvatar = selfPerson
    ? personAvatar(selfPerson)
    : SELF_AVATAR_DEFAULT

  function openSelf() {
    if (selfPerson) setEditing(selfPerson)
    else setCreating('self')
  }

  function closeForm() {
    setCreating(null)
    setEditing(null)
  }

  function onSaved() {
    refresh()
  }

  return (
    <Card variant="surface" padding="lg" radius="xl" className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Componenti del nucleo
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tu, i tuoi familiari (anche minori o non registrati) e gli animali.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setCreating('normal')}
        >
          + Nuovo
        </Button>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-ink-soft">Caricamento…</div>
      )}

      {!loading && (
        <ul className="mt-4 space-y-2">
          {/* "Io" sempre in cima, virtuale se non ancora salvato */}
          <li>
            <button
              type="button"
              onClick={openSelf}
              className="flex w-full items-center gap-3 rounded-2xl bg-[color:var(--surface-2)] px-3 py-2.5 text-left clay-sm transition hover:scale-[1.01]"
            >
              <span className="text-2xl" aria-hidden>
                {selfAvatar}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-ink">
                    {selfDisplayName}
                  </span>
                  <span className="rounded-full bg-[color:var(--candy-lemon)]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--candy-ink)]">
                    Io
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-ink-soft">
                  {selfPerson
                    ? PERSON_KIND_LABEL.human
                    : 'Tocca per personalizzare nome e avatar'}
                </div>
              </div>
            </button>
          </li>

          {others.map((p) => (
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
        open={creating !== null || editing !== null}
        onClose={closeForm}
        onSaved={onSaved}
        family={family}
        userId={user.id}
        selfBootstrap={
          creating === 'self'
            ? {
                displayName: emailPrefix(user.email),
                avatarEmoji: SELF_AVATAR_DEFAULT,
              }
            : null
        }
        onFamilyCreated={refreshFamily}
        initial={editing}
      />
    </Card>
  )
}
