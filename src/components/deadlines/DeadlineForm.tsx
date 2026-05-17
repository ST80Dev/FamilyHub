import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '../ui'
import { supabase } from '../../lib/supabase'
import { todayISO } from '../../lib/deadlineEngine'
import { DEADLINE_META, DEADLINE_TYPES } from '../../lib/deadlineMeta'
import { paymentMethodLabel } from '../../lib/paymentMethodMeta'
import { personAvatar } from '../../lib/personMeta'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { usePersons } from '../../hooks/usePersons'
import type { RecordScope } from '../../lib/ownership'
import type { Deadline, DeadlineType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  scope: RecordScope
  initial?: Deadline | null
  duplicateFrom?: Deadline | null
  onDuplicate?: (d: Deadline) => void
}

interface FormState {
  type: DeadlineType
  title: string
  due_date: string
  notes: string
  is_recurring: boolean
  recurrence_months: string
  reminder_days_before: string
  amount: string
  amount_is_estimated: boolean
  payment_method_id: string
  person_id: string
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
    amount: d?.amount != null ? String(d.amount) : '',
    amount_is_estimated: d?.amount_is_estimated ?? false,
    payment_method_id: d?.payment_method_id ?? '',
    person_id: d?.person_id ?? '',
  }
}

export function DeadlineForm({
  open,
  onClose,
  onSaved,
  scope,
  initial,
  duplicateFrom,
  onDuplicate,
}: Props) {
  const title = initial
    ? 'Modifica scadenza'
    : duplicateFrom
    ? 'Duplica scadenza'
    : 'Nuova scadenza'
  const key = initial
    ? `edit-${initial.id}`
    : duplicateFrom
    ? `dup-${duplicateFrom.id}`
    : 'new'
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <DeadlineFormBody
        key={key}
        scope={scope}
        initial={initial}
        duplicateFrom={duplicateFrom}
        onClose={onClose}
        onSaved={onSaved}
        onDuplicate={onDuplicate}
      />
    </Modal>
  )
}

interface BodyProps {
  scope: RecordScope
  initial?: Deadline | null
  duplicateFrom?: Deadline | null
  onClose: () => void
  onSaved: () => void
  onDuplicate?: (d: Deadline) => void
}

function DeadlineFormBody({
  scope,
  initial,
  duplicateFrom,
  onClose,
  onSaved,
  onDuplicate,
}: BodyProps) {
  const source = initial ?? duplicateFrom ?? null
  const [state, setState] = useState<FormState>(() => initialState(source))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesExpanded, setNotesExpanded] = useState(() =>
    Boolean(source?.notes),
  )
  const { persons } = usePersons()
  const { paymentMethods } = usePaymentMethods()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const parsedAmount =
        state.amount.trim() === ''
          ? null
          : Number(state.amount.replace(',', '.'))
      const base = {
        type: state.type,
        title: state.title.trim() || null,
        due_date: state.due_date,
        notes: state.notes.trim() || null,
        is_recurring: state.is_recurring,
        recurrence_months: state.is_recurring
          ? Number(state.recurrence_months) || null
          : null,
        reminder_days_before: Number(state.reminder_days_before) || 7,
        amount: parsedAmount != null && !Number.isNaN(parsedAmount) ? parsedAmount : null,
        amount_is_estimated:
          parsedAmount != null && !Number.isNaN(parsedAmount)
            ? state.amount_is_estimated
            : false,
        payment_method_id: state.payment_method_id || null,
        person_id: state.person_id || null,
      }

      const query = initial
        ? supabase.from('deadlines').update(base).eq('id', initial.id)
        : supabase.from('deadlines').insert({ ...base, ...scope })
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
        <Field
          label="Per chi?"
          hint={
            persons.length === 0
              ? 'Aggiungi i componenti del nucleo dalle Impostazioni'
              : 'Predefinito: tutta la famiglia'
          }
        >
          <Select
            value={state.person_id}
            onChange={(e) =>
              setState((s) => ({ ...s, person_id: e.target.value }))
            }
          >
            <option value="">👪 Generale / tutta la famiglia</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {personAvatar(p)} {p.display_name}
                {p.kind === 'pet' && p.species ? ` (${p.species})` : ''}
              </option>
            ))}
          </Select>
        </Field>

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

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Field
            label="Importo (€)"
            hint="Lascia vuoto se non lo conosci"
          >
            <Input
              inputMode="decimal"
              placeholder="0,00"
              value={state.amount}
              onChange={(e) => setState((s) => ({ ...s, amount: e.target.value }))}
            />
          </Field>
          <Field label=" ">
            <label className="flex h-[42px] items-center gap-2 px-1 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={state.amount_is_estimated}
                onChange={(e) =>
                  setState((s) => ({ ...s, amount_is_estimated: e.target.checked }))
                }
                disabled={state.amount.trim() === ''}
                className="h-4 w-4 accent-[color:var(--candy-peach-2)]"
              />
              Stimato
            </label>
          </Field>
        </div>

        <Field
          label="Metodo di pagamento"
          hint={
            paymentMethods.length === 0
              ? 'Aggiungi i tuoi metodi dalle Impostazioni'
              : undefined
          }
        >
          <Select
            value={state.payment_method_id}
            onChange={(e) =>
              setState((s) => ({ ...s, payment_method_id: e.target.value }))
            }
          >
            <option value="">— Nessuno —</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {paymentMethodLabel(pm)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="block">
          <button
            type="button"
            onClick={() => setNotesExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-ink"
          >
            <span>
              Note
              {!notesExpanded && state.notes
                ? ` · ${state.notes.length} caratteri`
                : ''}
            </span>
            <span aria-hidden className="text-base leading-none">
              {notesExpanded ? '−' : '+'}
            </span>
          </button>
          {notesExpanded && (
            <Textarea
              className="mt-1.5"
              value={state.notes}
              onChange={(e) =>
                setState((s) => ({ ...s, notes: e.target.value }))
              }
              maxLength={500}
              rows={2}
              autoFocus
            />
          )}
        </div>

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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={submitting}
              >
                Elimina
              </Button>
              {onDuplicate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(initial)}
                  disabled={submitting}
                >
                  Duplica
                </Button>
              )}
            </div>
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
