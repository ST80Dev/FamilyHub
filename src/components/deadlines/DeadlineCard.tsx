import type { Deadline, Person } from '../../types'
import { Card, IconTile, Badge } from '../ui'
import { deadlineMeta } from '../../lib/deadlineMeta'
import { daysUntil, urgencyBucket } from '../../lib/deadlineEngine'
import { formatCurrency, formatDate } from '../../lib/format'
import { personAvatar } from '../../lib/personMeta'

interface Props {
  deadline: Deadline
  person?: Person | null
  onClick?: () => void
}

function whenLabel(dueDate: string): string {
  const d = daysUntil(dueDate)
  if (d < 0) return `${Math.abs(d)} gg fa`
  if (d === 0) return 'oggi'
  if (d === 1) return 'domani'
  return `tra ${d} giorni`
}

function urgencyTone(due: string) {
  const u = urgencyBucket(due)
  if (u === 'overdue' || u === 'within7') return 'red' as const
  if (u === 'within30') return 'yellow' as const
  return 'green' as const
}

export function DeadlineCard({ deadline, person, onClick }: Props) {
  const meta = deadlineMeta(deadline.type)
  const title = deadline.title?.trim() || meta.label
  const when = whenLabel(deadline.due_date)
  const tone = urgencyTone(deadline.due_date)

  return (
    <Card
      variant="surface"
      padding="sm"
      radius="lg"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className="flex items-center gap-3 cursor-default"
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
          {person ? ` · ${person.display_name}` : ''}
        </div>
        <div className="mt-0.5 truncate text-[15px] font-bold leading-tight text-ink">
          {title}
        </div>
        {deadline.notes && (
          <div className="mt-0.5 truncate text-xs text-ink-soft">
            {deadline.notes}
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        {deadline.amount != null && (
          <span className="font-display text-sm font-bold text-ink">
            {deadline.amount_is_estimated ? '~ ' : ''}
            {formatCurrency(deadline.amount, deadline.currency)}
          </span>
        )}
        <span className="text-[11px] font-semibold text-ink-soft">
          {formatDate(deadline.due_date)}
        </span>
        <Badge tone={tone} size="sm">
          {when}
        </Badge>
      </div>
    </Card>
  )
}
