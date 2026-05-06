import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '../ui'
import { supabase } from '../../lib/supabase'
import {
  HUMAN_AVATARS,
  PERSON_KIND_LABEL,
  PET_AVATARS,
  defaultAvatarFor,
} from '../../lib/personMeta'
import { createFamily } from '../../lib/familyBootstrap'
import { recordOwnership } from '../../lib/ownership'
import type { Family, Person, PersonKind } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  family: Family | null
  userId: string
  /** When set, a new person is pre-marked as the user's "self" entry. */
  selfBootstrap?: { displayName: string; avatarEmoji: string } | null
  /** Notify parent that a family was just auto-created so it can refresh. */
  onFamilyCreated?: () => void
  initial?: Person | null
}

interface FormState {
  kind: PersonKind
  display_name: string
  avatar_emoji: string
  species: string
  birth_date: string
  notes: string
}

function initialState(
  p: Person | null | undefined,
  selfBootstrap: Props['selfBootstrap'],
): FormState {
  if (p) {
    return {
      kind: p.kind,
      display_name: p.display_name,
      avatar_emoji: p.avatar_emoji ?? '',
      species: p.species ?? '',
      birth_date: p.birth_date ?? '',
      notes: p.notes ?? '',
    }
  }
  if (selfBootstrap) {
    return {
      kind: 'human',
      display_name: selfBootstrap.displayName,
      avatar_emoji: selfBootstrap.avatarEmoji,
      species: '',
      birth_date: '',
      notes: '',
    }
  }
  return {
    kind: 'human',
    display_name: '',
    avatar_emoji: '',
    species: '',
    birth_date: '',
    notes: '',
  }
}

export function PersonForm(props: Props) {
  const { open, onClose, initial, selfBootstrap } = props
  const isSelf = !!selfBootstrap || initial?.linked_user_id != null
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initial
          ? isSelf
            ? 'Modifica «Io»'
            : 'Modifica componente'
          : selfBootstrap
            ? 'Configura «Io»'
            : 'Nuovo componente'
      }
    >
      <PersonFormBody
        key={initial?.id ?? (selfBootstrap ? 'self-new' : 'new')}
        {...props}
      />
    </Modal>
  )
}

function PersonFormBody({
  family,
  userId,
  selfBootstrap,
  onFamilyCreated,
  initial,
  onClose,
  onSaved,
}: Props) {
  const [state, setState] = useState<FormState>(() =>
    initialState(initial, selfBootstrap),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelf = !!selfBootstrap || initial?.linked_user_id != null
  // "Io" è sempre human: blocca il toggle per chiarezza.
  const lockKindToHuman = isSelf
  const willCreateFamily =
    !initial && !family && state.kind === 'human'

  const avatars = state.kind === 'pet' ? PET_AVATARS : HUMAN_AVATARS
  const selectedAvatar = state.avatar_emoji || defaultAvatarFor(state.kind)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const display_name = state.display_name.trim()
      if (!display_name) throw new Error('Il nome è obbligatorio')

      let activeFamily = family
      if (willCreateFamily) {
        activeFamily = await createFamily(null, display_name)
        onFamilyCreated?.()
      }

      const base = {
        kind: state.kind,
        display_name,
        avatar_emoji: state.avatar_emoji || null,
        species: state.kind === 'pet' ? state.species.trim() || null : null,
        birth_date: state.birth_date || null,
        notes: state.notes.trim() || null,
      }

      if (initial) {
        const { error: e } = await supabase
          .from('persons')
          .update(base)
          .eq('id', initial.id)
        if (e) throw e
      } else {
        const scope = recordOwnership(activeFamily, userId)
        const insert = {
          ...base,
          ...scope,
          linked_user_id: selfBootstrap ? userId : null,
        }
        const { error: e } = await supabase.from('persons').insert(insert)
        if (e) throw e
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!initial) return
    if (!window.confirm('Eliminare questo componente?')) return
    setSubmitting(true)
    try {
      const { error: e } = await supabase
        .from('persons')
        .delete()
        .eq('id', initial.id)
      if (e) throw e
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore eliminazione')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!lockKindToHuman && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl p-1 clay-inset">
          {(['human', 'pet'] as PersonKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() =>
                setState((s) => ({ ...s, kind: k, avatar_emoji: '' }))
              }
              className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
                state.kind === k
                  ? 'candy-peach-grad text-white clay-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {k === 'human' ? '👤 Persona' : '🐾 Animale'}
            </button>
          ))}
        </div>
      )}

      <Field
        label="Nome"
        hint={state.kind === 'pet' ? 'Es. Fido, Micia' : 'Es. Mario'}
      >
        <Input
          required
          maxLength={80}
          value={state.display_name}
          onChange={(e) =>
            setState((s) => ({ ...s, display_name: e.target.value }))
          }
        />
      </Field>

      <Field label="Avatar" hint="Scegli un'icona">
        <div className="flex flex-wrap gap-2">
          {avatars.map((emoji) => {
            const active = selectedAvatar === emoji
            return (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  setState((s) => ({ ...s, avatar_emoji: emoji }))
                }
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition ${
                  active
                    ? 'bg-[color:var(--candy-peach)]/40 ring-2 ring-[color:var(--ink)]'
                    : 'bg-[color:var(--surface-2)] hover:scale-105'
                }`}
                aria-label={emoji}
                aria-pressed={active}
              >
                {emoji}
              </button>
            )
          })}
        </div>
      </Field>

      {state.kind === 'pet' && (
        <Field label="Specie" hint="Es. Cane, Gatto, Coniglio">
          <Select
            value={state.species}
            onChange={(e) =>
              setState((s) => ({ ...s, species: e.target.value }))
            }
          >
            <option value="">— Non specificato —</option>
            <option value="Cane">Cane</option>
            <option value="Gatto">Gatto</option>
            <option value="Coniglio">Coniglio</option>
            <option value="Uccello">Uccello</option>
            <option value="Pesce">Pesce</option>
            <option value="Rettile">Rettile</option>
            <option value="Altro">Altro</option>
          </Select>
        </Field>
      )}

      <Field label="Data di nascita" hint="Opzionale">
        <Input
          type="date"
          value={state.birth_date}
          onChange={(e) =>
            setState((s) => ({ ...s, birth_date: e.target.value }))
          }
        />
      </Field>

      <Field label="Note">
        <Textarea
          rows={2}
          maxLength={500}
          value={state.notes}
          onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
        />
      </Field>

      {willCreateFamily && (
        <div className="rounded-2xl bg-[color:var(--candy-mint)]/30 px-3 py-2 text-xs text-[color:var(--candy-ink)]">
          Aggiungendo una persona viene creata anche la famiglia (
          <strong>«La mia famiglia»</strong>, rinominabile in /famiglia).
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-[color:var(--candy-peach)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        {initial && !isSelf ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={submitting}
          >
            Elimina
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" size="sm" loading={submitting}>
            {initial
              ? 'Salva'
              : selfBootstrap
                ? 'Salva «Io»'
                : `Crea ${PERSON_KIND_LABEL[state.kind].toLowerCase()}`}
          </Button>
        </div>
      </div>
    </form>
  )
}
