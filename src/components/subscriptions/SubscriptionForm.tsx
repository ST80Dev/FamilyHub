import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '../ui'
import { supabase } from '../../lib/supabase'
import { todayISO } from '../../lib/deadlineEngine'
import {
  BILLING_CYCLE_LABEL,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_META,
} from '../../lib/subscriptionMeta'
import {
  addMonthsISO,
  cancellationNoticeDate,
  lastDayOfMonthISO,
} from '../../lib/subscriptionForecast'
import { formatDate } from '../../lib/format'
import { paymentMethodLabel } from '../../lib/paymentMethodMeta'
import { personAvatar } from '../../lib/personMeta'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { usePersons } from '../../hooks/usePersons'
import type { RecordScope } from '../../lib/ownership'
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

type EndMode = 'none' | 'months' | 'month_year' | 'exact_date'
const END_MODE_LABEL: Record<EndMode, string> = {
  none: 'Nessuna — abbonamento a tempo indeterminato',
  months: 'Tra N mesi',
  month_year: 'Entro un mese/anno',
  exact_date: 'Data esatta',
}
const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  scope: RecordScope
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
  payment_method_id: string
  person_id: string
  end_mode: EndMode
  end_months: string
  end_month: string
  end_year: string
  end_date: string
  notice_days: string
}

function todayParts(): { month: string; year: string } {
  const d = new Date()
  return { month: String(d.getMonth() + 1), year: String(d.getFullYear()) }
}

function initialState(s?: Subscription | null): FormState {
  const today = todayParts()
  let end_mode: EndMode = 'none'
  let end_month = today.month
  let end_year = today.year
  let end_date = ''
  if (s?.planned_end_date) {
    end_mode = 'exact_date'
    end_date = s.planned_end_date
    const [y, m] = s.planned_end_date.split('-')
    end_year = y ?? today.year
    end_month = m ? String(Number(m)) : today.month
  }
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
    payment_method_id: s?.payment_method_id ?? '',
    person_id: s?.person_id ?? '',
    end_mode,
    end_months: '6',
    end_month,
    end_year,
    end_date,
    notice_days: s?.cancellation_notice_days != null
      ? String(s.cancellation_notice_days)
      : '',
  }
}

/** Trasforma la modalità + input dell'utente in una data ISO (o null). */
function resolvePlannedEnd(s: FormState): string | null {
  switch (s.end_mode) {
    case 'none':
      return null
    case 'months': {
      const n = Number(s.end_months)
      if (!Number.isFinite(n) || n <= 0) return null
      return addMonthsISO(todayISO(), Math.round(n))
    }
    case 'month_year': {
      const m = Number(s.end_month)
      const y = Number(s.end_year)
      if (!Number.isInteger(m) || m < 1 || m > 12) return null
      if (!Number.isInteger(y) || y < 1900 || y > 9999) return null
      return lastDayOfMonthISO(y, m - 1)
    }
    case 'exact_date':
      return s.end_date || null
  }
}

export function SubscriptionForm({
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
      title={initial ? 'Modifica abbonamento' : 'Nuovo abbonamento'}
    >
      <SubscriptionFormBody
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
  initial?: Subscription | null
  onClose: () => void
  onSaved: () => void
}

function SubscriptionFormBody({
  scope,
  initial,
  onClose,
  onSaved,
}: BodyProps) {
  const [state, setState] = useState<FormState>(() => initialState(initial))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesExpanded, setNotesExpanded] = useState(() =>
    Boolean(initial?.notes),
  )
  const { paymentMethods } = usePaymentMethods()
  const { persons } = usePersons()

  const plannedEndPreview = useMemo(() => resolvePlannedEnd(state), [state])
  const noticePreview = useMemo(() => {
    if (!plannedEndPreview) return null
    const notice = Number(state.notice_days) || 0
    if (notice <= 0) return null
    return cancellationNoticeDate({
      planned_end_date: plannedEndPreview,
      cancellation_notice_days: notice,
    } as Subscription)
  }, [plannedEndPreview, state.notice_days])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const planned_end_date = resolvePlannedEnd(state)
      const noticeRaw = state.notice_days.trim()
      const cancellation_notice_days =
        planned_end_date && noticeRaw !== ''
          ? Math.max(0, Math.min(365, Number(noticeRaw) || 0))
          : null
      const base = {
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
        payment_method_id: state.payment_method_id || null,
        person_id: state.person_id || null,
        planned_end_date,
        cancellation_notice_days,
      }

      const query = initial
        ? supabase.from('subscriptions').update(base).eq('id', initial.id)
        : supabase.from('subscriptions').insert({ ...base, ...scope })
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

      <div className="rounded-2xl bg-[color:var(--surface-2)]/60 p-3 space-y-3">
        <Field
          label="Disdetta pianificata"
          hint="Per scorporare il costo dopo la fine prevista e ricordarti di disdire in tempo"
        >
          <Select
            value={state.end_mode}
            onChange={(e) =>
              setState((s) => ({ ...s, end_mode: e.target.value as EndMode }))
            }
          >
            {(['none', 'months', 'month_year', 'exact_date'] as EndMode[]).map(
              (m) => (
                <option key={m} value={m}>
                  {END_MODE_LABEL[m]}
                </option>
              ),
            )}
          </Select>
        </Field>

        {state.end_mode === 'months' && (
          <Field label="Tra quanti mesi">
            <Input
              type="number"
              min={1}
              max={120}
              value={state.end_months}
              onChange={(e) =>
                setState((s) => ({ ...s, end_months: e.target.value }))
              }
            />
          </Field>
        )}

        {state.end_mode === 'month_year' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mese">
              <Select
                value={state.end_month}
                onChange={(e) =>
                  setState((s) => ({ ...s, end_month: e.target.value }))
                }
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Anno">
              <Input
                type="number"
                min={new Date().getFullYear()}
                max={2100}
                value={state.end_year}
                onChange={(e) =>
                  setState((s) => ({ ...s, end_year: e.target.value }))
                }
              />
            </Field>
          </div>
        )}

        {state.end_mode === 'exact_date' && (
          <Field label="Data esatta di fine">
            <Input
              type="date"
              value={state.end_date}
              onChange={(e) =>
                setState((s) => ({ ...s, end_date: e.target.value }))
              }
            />
          </Field>
        )}

        {state.end_mode !== 'none' && (
          <>
            <Field
              label="Giorni di preavviso obbligatori"
              hint="Es. 30 se il contratto richiede un mese di preavviso. Lascia vuoto se non c'è preavviso."
            >
              <Input
                type="number"
                min={0}
                max={365}
                placeholder="0"
                value={state.notice_days}
                onChange={(e) =>
                  setState((s) => ({ ...s, notice_days: e.target.value }))
                }
              />
            </Field>
            {plannedEndPreview && (
              <div className="rounded-xl bg-[color:var(--surface)] px-3 py-2 text-xs text-ink-soft">
                <div>
                  Fine prevista:{' '}
                  <strong className="text-ink">
                    {formatDate(plannedEndPreview)}
                  </strong>
                </div>
                {noticePreview && (
                  <div className="mt-0.5">
                    Avvisa di disdire entro:{' '}
                    <strong className="text-ink">
                      {formatDate(noticePreview)}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </>
        )}
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
            rows={2}
            maxLength={500}
            value={state.notes}
            onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
            autoFocus
          />
        )}
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
