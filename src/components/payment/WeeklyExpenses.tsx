import { useMemo } from 'react'
import { Card } from '../ui'
import { useDeadlines } from '../../hooks/useDeadlines'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { daysUntil, nextBillingDate, todayISO } from '../../lib/deadlineEngine'
import { formatCurrency } from '../../lib/format'
import {
  PAYMENT_METHOD_ICON,
  paymentMethodLabel,
} from '../../lib/paymentMethodMeta'
import type { PaymentMethod } from '../../types'

interface WeekItem {
  source: 'deadline' | 'subscription'
  amount: number
  paymentMethodId: string | null
  isEstimated: boolean
  date: string
  label: string
}

interface Bucket {
  pm: PaymentMethod | null
  total: number
  hasEstimate: boolean
  count: number
  nextDate: string
}

const NO_METHOD_KEY = '__none__'

export function WeeklyExpenses() {
  const { deadlines } = useDeadlines()
  const { subscriptions } = useSubscriptions()
  const { paymentMethods } = usePaymentMethods()

  const items: WeekItem[] = useMemo(() => {
    const today = todayISO()
    const out: WeekItem[] = []

    for (const d of deadlines) {
      if (d.status === 'done') continue
      if (d.amount == null) continue
      const days = daysUntil(d.due_date, today)
      if (days < 0 || days > 7) continue
      out.push({
        source: 'deadline',
        amount: Number(d.amount),
        paymentMethodId: d.payment_method_id,
        isEstimated: d.amount_is_estimated,
        date: d.due_date,
        label: d.title ?? d.type,
      })
    }

    for (const s of subscriptions) {
      if (s.status !== 'active') continue
      let next: string | null = s.next_billing_date
      if (next) {
        const d = daysUntil(next, today)
        if (d < 0) next = nextBillingDate(next, s.billing_cycle)
      }
      if (!next) continue
      const days = daysUntil(next, today)
      if (days < 0 || days > 7) continue
      out.push({
        source: 'subscription',
        amount: Number(s.amount),
        paymentMethodId: s.payment_method_id,
        isEstimated: false,
        date: next,
        label: s.name,
      })
    }

    return out.sort((a, b) => a.date.localeCompare(b.date))
  }, [deadlines, subscriptions])

  const buckets = useMemo<Bucket[]>(() => {
    const map = new Map<string, Bucket>()
    for (const it of items) {
      const key = it.paymentMethodId ?? NO_METHOD_KEY
      const existing = map.get(key)
      if (existing) {
        existing.total += it.amount
        existing.count += 1
        existing.hasEstimate = existing.hasEstimate || it.isEstimated
        if (it.date < existing.nextDate) existing.nextDate = it.date
      } else {
        map.set(key, {
          pm:
            it.paymentMethodId
              ? paymentMethods.find((p) => p.id === it.paymentMethodId) ?? null
              : null,
          total: it.amount,
          count: 1,
          hasEstimate: it.isEstimated,
          nextDate: it.date,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [items, paymentMethods])

  if (items.length === 0) return null

  const grandTotal = items.reduce((acc, it) => acc + it.amount, 0)
  const hasAnyEstimate = items.some((it) => it.isEstimated)

  return (
    <section className="mt-6">
      <header className="flex items-center justify-between px-1">
        <h2 className="font-display text-xl font-bold text-ink">
          Questa settimana
        </h2>
        <span className="text-xs font-semibold text-ink-soft">
          {items.length} {items.length === 1 ? 'addebito' : 'addebiti'}
        </span>
      </header>

      <Card variant="surface" padding="md" radius="lg" className="mt-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
          Totale previsto
        </div>
        <div className="font-display mt-0.5 text-2xl font-bold leading-none text-ink">
          {hasAnyEstimate ? '~ ' : ''}
          {formatCurrency(grandTotal)}
        </div>

        <ul className="mt-3 space-y-2">
          {buckets.map((b, i) => {
            const label = b.pm
              ? paymentMethodLabel(b.pm)
              : 'Nessun metodo associato'
            const icon = b.pm
              ? PAYMENT_METHOD_ICON[b.pm.type]
              : '❓'
            return (
              <li
                key={b.pm?.id ?? `none-${i}`}
                className="flex items-center gap-3 rounded-2xl bg-[color:var(--surface-2)] px-3 py-2"
              >
                <span className="text-xl" aria-hidden>
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink">
                    {label}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {b.count} {b.count === 1 ? 'addebito' : 'addebiti'}
                    {b.hasEstimate ? ' · stima' : ''}
                  </div>
                </div>
                <div className="font-display text-base font-bold text-ink">
                  {b.hasEstimate ? '~ ' : ''}
                  {formatCurrency(b.total)}
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          {buckets.length === 1 && buckets[0].pm
            ? `Ricorda di avere fondi sufficienti su ${buckets[0].pm.label} entro la fine della settimana.`
            : 'Controlla di avere fondi sufficienti sui metodi indicati prima dei prossimi addebiti.'}
        </p>
      </Card>
    </section>
  )
}
