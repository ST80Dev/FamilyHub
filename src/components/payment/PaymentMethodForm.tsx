import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input, Modal, Select } from '../ui'
import { supabase } from '../../lib/supabase'
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_TYPES,
} from '../../lib/paymentMethodMeta'
import type { RecordScope } from '../../lib/ownership'
import type { PaymentMethod, PaymentMethodType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  scope: RecordScope
  initial?: PaymentMethod | null
}

interface FormState {
  type: PaymentMethodType
  label: string
  issuer: string
  last4: string
  is_default: boolean
}

function initialState(pm?: PaymentMethod | null): FormState {
  return {
    type: pm?.type ?? 'credit_card',
    label: pm?.label ?? '',
    issuer: pm?.issuer ?? '',
    last4: pm?.last4 ?? '',
    is_default: pm?.is_default ?? false,
  }
}

export function PaymentMethodForm({
  open,
  onClose,
  onSaved,
  scope,
  initial,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifica metodo' : 'Nuovo metodo di pagamento'}
    >
      <PaymentMethodFormBody
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
  initial?: PaymentMethod | null
  onClose: () => void
  onSaved: () => void
}

function PaymentMethodFormBody({ scope, initial, onClose, onSaved }: BodyProps) {
  const [state, setState] = useState<FormState>(() => initialState(initial))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const last4 = state.last4.trim()
      if (last4 && !/^[0-9]{2,4}$/.test(last4)) {
        throw new Error('Le ultime cifre devono essere 2-4 numeri')
      }
      const base = {
        type: state.type,
        label: state.label.trim(),
        issuer: state.issuer.trim() || null,
        last4: last4 || null,
        is_default: state.is_default,
      }
      if (!base.label) throw new Error('Il nome è obbligatorio')

      const query = initial
        ? supabase.from('payment_methods').update(base).eq('id', initial.id)
        : supabase.from('payment_methods').insert({ ...base, ...scope })
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
    if (!window.confirm('Eliminare questo metodo di pagamento?')) return
    setSubmitting(true)
    try {
      const { error: e } = await supabase
        .from('payment_methods')
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
            setState((s) => ({ ...s, type: e.target.value as PaymentMethodType }))
          }
        >
          {PAYMENT_METHOD_TYPES.map((t) => (
            <option key={t} value={t}>
              {PAYMENT_METHOD_LABEL[t]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Nome" hint="Es. Visa Famiglia, Conto Intesa">
        <Input
          required
          maxLength={80}
          value={state.label}
          onChange={(e) => setState((s) => ({ ...s, label: e.target.value }))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Banca / circuito" hint="Opzionale">
          <Input
            maxLength={60}
            value={state.issuer}
            onChange={(e) =>
              setState((s) => ({ ...s, issuer: e.target.value }))
            }
          />
        </Field>
        <Field label="Ultime cifre" hint="2-4 numeri, opzionale">
          <Input
            inputMode="numeric"
            maxLength={4}
            value={state.last4}
            onChange={(e) =>
              setState((s) => ({ ...s, last4: e.target.value.replace(/\D/g, '') }))
            }
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 px-1 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={state.is_default}
          onChange={(e) =>
            setState((s) => ({ ...s, is_default: e.target.checked }))
          }
          className="h-4 w-4 accent-[color:var(--candy-peach-2)]"
        />
        Imposta come predefinito
      </label>

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
