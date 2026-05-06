import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '../ui'
import { supabase } from '../../lib/supabase'
import { todayISO } from '../../lib/deadlineEngine'
import {
  BILLING_CYCLE_LABEL,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_META,
} from '../../lib/subscriptionMeta'
import type {
  BillingCycle,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from '../../types'

const STATUSES: SubscriptionStatus[] = ['active', 'paused', 'cancelled']
const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Attivo',
  paused: 'In pausa',
  cancelled: 'Cancellato',
}
const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'semiannual', 'annual']

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  familyId: string
  initial?: Subscription | null
}

interface FormState {
  name: string
  provider: string
  category: SubscriptionCategory
  amount: string
  currency: string
  billing_cycle: BillingCycle
  next_billing_date: string
  status: SubscriptionStatus
  auto_renews: boolean
  reminder_days_before: string
  notes: string
}

function initialState(s?: Subscription | null): FormState {
  return {
    name: s?.name ?? '',
    provider: s?.provider ?? '',
    category: s?.category ?? 'streaming',
    amount: s ? String(s.amount) : '',
    currency: s?.currency ?? 'EUR',
    billing_cycle: s?.billing_cycle ?? 'monthly',
    next_billing_date: s?.next_billing_date ?? todayISO(),
    status: s?.status ?? 'active',
    auto_renews: s?.auto_renews ?? true,
    reminder_days_before: String(s?.reminder_days_before ?? 3),
    notes: s?.notes ?? '',
  }
}

export function SubscriptionForm({
  open,
  onClose,
  onSaved,
  familyId,
  initial,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifica abbonamento' : 'Nuovo abbonamento'}
    >
      <SubscriptionFormBody
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
  initial?: Subscription | null
  onClose: () => void
  onSaved: () => void
}

function SubscriptionFormBody({
  familyId,
  initial,
  onClose,
  onSaved,
}: BodyProps) {
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
        name: state.name.trim(),
        provider: state.provider.trim() || null,
        category: state.category,
        amount: Number(state.amount.replace(',', '.')) || 0,
        currency: state.currency.trim().toUpperCase() || 'EUR',
        billing_cycle: state.billing_cycle,
        next_billing_date: state.next_billing_date || null,
        status: state.status,
        auto_renews: state.auto_renews,
        reminder_days_before: Number(state.reminder_days_before) || 3,
        notes: state.notes.trim() || null,
      }

      const query = initial
        ? supabase.from('subscriptions').update(payload).eq('id', initial.id)
        : supabase.from('subscriptions').insert(payload)
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
    if (!window.confirm('Eliminare questo abbonamento?')) return
    setSubmitting(true)
    try {
      const { error: e } = await supabase
        .from('subscriptions')
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
      <Field label="Nome" hint="Es. Netflix Standard, Spotify Family">
        <Input
          required
          maxLength={120}
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria">
          <Select
            value={state.category}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                category: e.target.value as SubscriptionCategory,
              }))
            }
          >
            {SUBSCRIPTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {SUBSCRIPTION_META[c].icon} {SUBSCRIPTION_META[c].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Provider" hint="Opzionale">
          <Input
            maxLength={80}
            value={state.provider}
            onChange={(e) => setState((s) => ({ ...s, provider: e.target.value }))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Importo">
          <Input
            inputMode="decimal"
            placeholder="0,00"
            value={state.amount}
            onChange={(e) => setState((s) => ({ ...s, amount: e.target.value }))}
            required
          />
        </Field>
        <Field label="Valuta">
          <Input
            maxLength={3}
            value={state.currency}
            onChange={(e) =>
              setState((s) => ({ ...s, currency: e.target.value.toUpperCase() }))
            }
            style={{ width: '5rem', textTransform: 'uppercase' }}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Frequenza">
          <Select
            value={state.billing_cycle}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                billing_cycle: e.target.value as BillingCycle,
              }))
            }
          >
            {CYCLES.map((c) => (
              <option key={c} value={c}>
                {BILLING_CYCLE_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prossimo addebito">
          <Input
            type="date"
            value={state.next_billing_date}
            onChange={(e) =>
              setState((s) => ({ ...s, next_billing_date: e.target.value }))
            }
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Stato">
          <Select
            value={state.status}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                status: e.target.value as SubscriptionStatus,
              }))
            }
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABEL[st]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Promemoria (gg prima)">
          <Input
            type="number"
            min={0}
            max={30}
            value={state.reminder_days_before}
            onChange={(e) =>
              setState((s) => ({ ...s, reminder_days_before: e.target.value }))
            }
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 px-1 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={state.auto_renews}
          onChange={(e) =>
            setState((s) => ({ ...s, auto_renews: e.target.checked }))
          }
          className="h-4 w-4 accent-[color:var(--candy-peach-2)]"
        />
        Si rinnova automaticamente
      </label>

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
            {initial ? 'Salva' : 'Crea'}
          </Button>
        </div>
      </div>
    </form>
  )
}
