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
import type { RecordScope } from '../../lib/ownership'
import type { Person, PersonKind } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  scope: RecordScope
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

function initialState(p?: Person | null): FormState {
  return {
    kind: p?.kind ?? 'human',
    display_name: p?.display_name ?? '',
    avatar_emoji: p?.avatar_emoji ?? '',
    species: p?.species ?? '',
    birth_date: p?.birth_date ?? '',
    notes: p?.notes ?? '',
  }
}

export function PersonForm({ open, onClose, onSaved, scope, initial }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifica componente' : 'Nuovo componente'}
    >
      <PersonFormBody
        key={initial?.id ?? 'new'}
        scope={scope}
        initial={initial}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  )
}

interface BodyProps {
  scope: RecordScope
  initial?: Person | null
  onClose: () => void
  onSaved: () => void
}

function PersonFormBody({ scope, initial, onClose, onSaved }: BodyProps) {
  const [state, setState] = useState<FormState>(() => initialState(initial))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avatars = state.kind === 'pet' ? PET_AVATARS : HUMAN_AVATARS
  const selectedAvatar = state.avatar_emoji || defaultAvatarFor(state.kind)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const display_name = state.display_name.trim()
      if (!display_name) throw new Error('Il nome è obbligatorio')
      const base = {
        kind: state.kind,
        display_name,
        avatar_emoji: state.avatar_emoji || null,
        species: state.kind === 'pet' ? state.species.trim() || null : null,
        birth_date: state.birth_date || null,
        notes: state.notes.trim() || null,
      }
      const query = initial
        ? supabase.from('persons').update(base).eq('id', initial.id)
        : supabase.from('persons').insert({ ...base, ...scope })
      const { error: e } = await query
      if (e) throw e
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

      <Field
        label={state.kind === 'pet' ? 'Data di nascita' : 'Data di nascita'}
        hint="Opzionale"
      >
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

      {error && (
        <div className="rounded-2xl bg-[color:var(--candy-peach)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        {initial ? (
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
            {initial ? 'Salva' : `Crea ${PERSON_KIND_LABEL[state.kind].toLowerCase()}`}
          </Button>
        </div>
      </div>
    </form>
  )
}
