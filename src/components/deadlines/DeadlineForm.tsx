import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '../ui'
import { supabase } from '../../lib/supabase'
import { todayISO } from '../../lib/deadlineEngine'
import { DEADLINE_META, DEADLINE_TYPES } from '../../lib/deadlineMeta'
import type { Deadline, DeadlineType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  familyId: string
  initial?: Deadline | null
}

interface FormState {
  type: DeadlineType
  title: string
  due_date: string
  notes: string
  is_recurring: boolean
  recurrence_months: string
  reminder_days_before: string
}

function initialState(d?: Deadline | null): FormState {
  return {
    type: d?.type ?? 'custom',
    title: d?.title ?? '',
    due_date: d?.due_date ?? todayISO(),
    notes: d?.notes ?? '',
    is_recurring: d?.is_recurring ?? false,
    recurrence_months: d?.recurrence_months ? String(d.recurrence_months) : '12',
    reminder_days_before: String(d?.reminder_days_before ?? 7),
  }
}

export function DeadlineForm({ open, onClose, onSaved, familyId, initial }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifica scadenza' : 'Nuova scadenza'}
    >
      <DeadlineFormBody
        key={initial?.id ?? 'new'}
        familyId={familyId}
        initial={initial}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  )
}

interface BodyProps {
  familyId: string
  initial?: Deadline | null
  onClose: () => void
  onSaved: () => void
}

function DeadlineFormBody({ familyId, initial, onClose, onSaved }: BodyProps) {
  const [state, setState] = useState<FormState>(() => initialState(initial))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        family_id: familyId,
        type: state.type,
        title: state.title.trim() || null,
        due_date: state.due_date,
        notes: state.notes.trim() || null,
        is_recurring: state.is_recurring,
        recurrence_months: state.is_recurring
          ? Number(state.recurrence_months) || null
          : null,
        reminder_days_before: Number(state.reminder_days_before) || 7,
      }

      const query = initial
        ? supabase.from('deadlines').update(payload).eq('id', initial.id)
        : supabase.from('deadlines').insert(payload)
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
    if (!window.confirm('Eliminare questa scadenza?')) return
    setSubmitting(true)
    try {
      const { error: e } = await supabase
        .from('deadlines')
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
        <Field label="Tipo">
          <Select
            value={state.type}
            onChange={(e) =>
              setState((s) => ({ ...s, type: e.target.value as DeadlineType }))
            }
          >
            {DEADLINE_TYPES.map((t) => (
              <option key={t} value={t}>
                {DEADLINE_META[t].icon} {DEADLINE_META[t].label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Titolo"
          hint={state.type === 'custom' ? 'Es. Rinnovo abbonamento gas' : 'Es. Fiat Panda · EX123YZ (opzionale)'}
        >
          <Input
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            required={state.type === 'custom'}
            maxLength={120}
          />
        </Field>

        <Field label="Data scadenza">
          <Input
            type="date"
            value={state.due_date}
            onChange={(e) => setState((s) => ({ ...s, due_date: e.target.value }))}
            required
          />
        </Field>

        <Field label="Note">
          <Textarea
            value={state.notes}
            onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
            maxLength={500}
            rows={2}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Promemoria (giorni prima)">
            <Input
              type="number"
              min={0}
              max={90}
              value={state.reminder_days_before}
              onChange={(e) =>
                setState((s) => ({ ...s, reminder_days_before: e.target.value }))
              }
            />
          </Field>
          <Field label="Ricorrenza (mesi)" hint="0 = una tantum">
            <Input
              type="number"
              min={0}
              max={120}
              value={state.is_recurring ? state.recurrence_months : '0'}
              onChange={(e) => {
                const n = Number(e.target.value)
                setState((s) => ({
                  ...s,
                  is_recurring: n > 0,
                  recurrence_months: e.target.value,
                }))
              }}
            />
          </Field>
        </div>

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
              {initial ? 'Salva' : 'Crea'}
            </Button>
          </div>
      </div>
    </form>
  )
}
