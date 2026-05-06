import type { Person, Subscription } from '../../types'
import { Card, IconTile, Badge } from '../ui'
import {
  BILLING_CYCLE_LABEL,
  monthlyEquivalent,
  subscriptionMeta,
} from '../../lib/subscriptionMeta'
import { formatCurrency, formatDate } from '../../lib/format'
import { daysUntil, nextBillingDate } from '../../lib/deadlineEngine'
import { personAvatar } from '../../lib/personMeta'

interface Props {
  subscription: Subscription
  person?: Person | null
  onClick?: () => void
}

function nextDate(s: Subscription): string | null {
  if (!s.next_billing_date) return null
  if (daysUntil(s.next_billing_date) >= 0) return s.next_billing_date
  return nextBillingDate(s.next_billing_date, s.billing_cycle)
}

function whenLabel(date: string): string {
  const d = daysUntil(date)
  if (d < 0) return `${Math.abs(d)} gg fa`
  if (d === 0) return 'oggi'
  if (d === 1) return 'domani'
  return `tra ${d} gg`
}

export function SubscriptionCard({ subscription, person, onClick }: Props) {
  const meta = subscriptionMeta(subscription.category)
  const next = nextDate(subscription)
  const monthly =
    subscription.billing_cycle === 'monthly'
      ? null
      : monthlyEquivalent(Number(subscription.amount) || 0, subscription.billing_cycle)
  const isPaused = subscription.status === 'paused'
  const isCancelled = subscription.status === 'cancelled'

  return (
    <Card
      variant="surface"
      padding="sm"
      radius="lg"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className="flex items-center gap-3"
    >
      <div className="relative flex-shrink-0">
        <IconTile tone={meta.tone} size="lg" inset>
          <span aria-hidden>{meta.icon}</span>
        </IconTile>
        {person && (
          <span
            aria-label={person.display_name}
            title={person.display_name}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface)] text-sm clay-sm"
          >
            {personAvatar(person)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
          {meta.label}
          {subscription.provider && ` · ${subscription.provider}`}
          {person && ` · ${person.display_name}`}
        </div>
        <div className="mt-0.5 truncate text-[15px] font-bold leading-tight text-ink">
          {subscription.name}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
          <span className="font-semibold">
            {formatCurrency(subscription.amount, subscription.currency)}
          </span>
          <span>·</span>
          <span>{BILLING_CYCLE_LABEL[subscription.billing_cycle]}</span>
          {monthly !== null && (
            <>
              <span>·</span>
              <span>
                {formatCurrency(monthly, subscription.currency)}/mese
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        {isPaused && (
          <Badge tone="yellow" size="sm">
            in pausa
          </Badge>
        )}
        {isCancelled && (
          <Badge tone="neutral" size="sm">
            cancellato
          </Badge>
        )}
        {!isPaused && !isCancelled && next && (
          <>
            <span className="text-[11px] font-semibold text-ink-soft">
              {formatDate(next)}
            </span>
            <Badge tone="sky" size="sm">
              {whenLabel(next)}
            </Badge>
          </>
        )}
      </div>
    </Card>
  )
}
