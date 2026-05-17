import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '../ui'
import { supabase } from '../../lib/supabase'
import { VOUCHER_META, VOUCHER_STATUS_LABEL, VOUCHER_TYPES } from '../../lib/voucherMeta'
import { personAvatar } from '../../lib/personMeta'
import { usePersons } from '../../hooks/usePersons'
import type { RecordScope } from '../../lib/ownership'
import type { Voucher, VoucherStatus, VoucherType } from '../../types'

const STATUSES: VoucherStatus[] = ['available', 'used', 'expired']

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  scope: RecordScope
  initial?: Voucher | null
  issuerSuggestions?: string[]
}

interface FormState {
  type: VoucherType
  issuer: string
  code: string
  amount: string
  is_percentage: boolean
  currency: string
  issue_date: string
  expiry_date: string
  status: VoucherStatus
  person_id: string
  notes: string
}

function initialState(v?: Voucher | null): FormState {
  return {
    type: v?.type ?? 'regalo',
    issuer: v?.issuer ?? '',
    code: v?.code ?? '',
    amount: v ? String(v.amount) : '',
    is_percentage: v?.is_percentage ?? false,
    currency: v?.currency ?? 'EUR',
    issue_date: v?.issue_date ?? '',
    expiry_date: v?.expiry_date ?? '',
    status: v?.status ?? 'available',
    person_id: v?.person_id ?? '',
    notes: v?.notes ?? '',
  }
}

export function VoucherForm({
  open,
  onClose,
  onSaved,
  scope,
  initial,
  issuerSuggestions,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifica buono' : 'Nuovo buono'}
    >
      <VoucherFormBody
        key={initial?.id ?? 'new'}
        scope={scope}
        initial={initial}
        onClose={onClose}
        onSaved={onSaved}
        issuerSuggestions={issuerSuggestions ?? []}
      />
    </Modal>
  )
}

interface BodyProps {
  scope: RecordScope
  initial?: Voucher | null
  onClose: () => void
  onSaved: () => void
  issuerSuggestions: string[]
}

function VoucherFormBody({
  scope,
  initial,
  onClose,
  onSaved,
  issuerSuggestions,
}: BodyProps) {
  const [state, setState] = useState<FormState>(() => initialState(initial))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesExpanded, setNotesExpanded] = useState(() => Boolean(initial?.notes))
  const [showCode, setShowCode] = useState(false)
  const [issuerFocused, setIssuerFocused] = useState(false)
  const issuerBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { persons } = usePersons()

  const filteredIssuers = useMemo(() => {
    const q = state.issuer.trim().toLowerCase()
    if (!q) return []
    return issuerSuggestions
      .filter((s) => {
        const lower = s.toLowerCase()
        return lower.includes(q) && lower !== q
      })
      .slice(0, 6)
  }, [state.issuer, issuerSuggestions])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const base = {
        type: state.type,
        issuer: state.issuer.trim(),
        code: state.code.trim() || null,
        amount: Number(state.amount.replace(',', '.')) || 0,
        is_percentage: state.is_percentage,
        currency: state.is_percentage
          ? 'EUR'
          : state.currency.trim().toUpperCase() || 'EUR',
        issue_date: state.issue_date || null,
        expiry_date: state.expiry_date || null,
        status: state.status,
        person_id: state.person_id || null,
        notes: state.notes.trim() || null,
      }

      const query = initial
        ? supabase.from('vouchers').update(base).eq('id', initial.id)
        : supabase.from('vouchers').insert({ ...base, ...scope })
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
    if (!window.confirm('Eliminare questo buono?')) return
    setSubmitting(true)
    try {
      const { error: e } = await supabase
        .from('vouchers')
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
    <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
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

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <Select
            value={state.type}
            onChange={(e) =>
              setState((s) => ({ ...s, type: e.target.value as VoucherType }))
            }
          >
            {VOUCHER_TYPES.map((t) => (
              <option key={t} value={t}>
                {VOUCHER_META[t].icon} {VOUCHER_META[t].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stato">
          <Select
            value={state.status}
            onChange={(e) =>
              setState((s) => ({ ...s, status: e.target.value as VoucherStatus }))
            }
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {VOUCHER_STATUS_LABEL[st]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Emittente" hint="Es. Amazon, IKEA, Decathlon, INPS">
        <div className="relative">
          <Input
            required
            maxLength={120}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="voucher-issuer"
            value={state.issuer}
            onChange={(e) => setState((s) => ({ ...s, issuer: e.target.value }))}
            onFocus={() => {
              if (issuerBlurTimer.current) {
                clearTimeout(issuerBlurTimer.current)
                issuerBlurTimer.current = null
              }
              setIssuerFocused(true)
            }}
            onBlur={() => {
              issuerBlurTimer.current = setTimeout(
                () => setIssuerFocused(false),
                120,
              )
            }}
          />
          {issuerFocused && filteredIssuers.length > 0 && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] clay-card py-1 shadow-lg"
            >
              {filteredIssuers.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setState((st) => ({ ...st, issuer: s }))
                      setIssuerFocused(false)
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-[color:var(--candy-peach)]/30"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      <Field
        label="Codice"
        hint={state.code ? 'Tocca l’occhio per mostrare/nascondere' : 'Opzionale'}
      >
        <div className="relative">
          <Input
            type="text"
            maxLength={120}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="voucher-code"
            value={state.code}
            onChange={(e) => setState((s) => ({ ...s, code: e.target.value }))}
            style={{
              paddingRight: '2.75rem',
              WebkitTextSecurity: showCode ? 'none' : 'disc',
              textSecurity: showCode ? 'none' : 'disc',
            } as CSSProperties}
          />
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            aria-label={showCode ? 'Nascondi codice' : 'Mostra codice'}
            className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-full text-base text-ink-soft hover:text-ink"
          >
            {showCode ? '🙈' : '👁'}
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Valore">
          <Input
            inputMode="decimal"
            placeholder="0,00"
            value={state.amount}
            onChange={(e) => setState((s) => ({ ...s, amount: e.target.value }))}
            required
          />
        </Field>
        {state.is_percentage ? (
          <Field label="Unità">
            <div className="flex h-[42px] w-[5rem] items-center justify-center rounded-2xl bg-[color:var(--surface)] text-sm font-bold text-ink clay-inset border border-[color:var(--line)]">
              %
            </div>
          </Field>
        ) : (
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
        )}
      </div>

      <label className="flex items-center gap-2 px-1 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={state.is_percentage}
          onChange={(e) =>
            setState((s) => ({ ...s, is_percentage: e.target.checked }))
          }
          className="h-4 w-4 accent-[color:var(--candy-peach-2)]"
        />
        È una percentuale di sconto (es. 20%)
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data emissione" hint="Opzionale">
          <Input
            type="date"
            value={state.issue_date}
            onChange={(e) =>
              setState((s) => ({ ...s, issue_date: e.target.value }))
            }
          />
        </Field>
        <Field label="Scadenza" hint="Lascia vuoto se non scade">
          <Input
            type="date"
            value={state.expiry_date}
            onChange={(e) =>
              setState((s) => ({ ...s, expiry_date: e.target.value }))
            }
          />
        </Field>
      </div>

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
