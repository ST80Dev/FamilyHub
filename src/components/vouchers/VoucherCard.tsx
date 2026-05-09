import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Badge, Card, IconTile } from '../ui'
import { voucherMeta } from '../../lib/voucherMeta'
import { formatCurrency, formatDate, formatNumber } from '../../lib/format'
import { daysUntil } from '../../lib/deadlineEngine'
import { personAvatar } from '../../lib/personMeta'
import { supabase } from '../../lib/supabase'
import type { Person, Voucher } from '../../types'

interface Props {
  voucher: Voucher
  person?: Person | null
  onClick?: () => void
  onChanged?: () => void
}

function urgency(expiry: string | null, status: Voucher['status']): {
  tone: 'red' | 'yellow' | 'green' | 'neutral'
  label: string | null
} {
  if (status === 'used') return { tone: 'neutral', label: 'usato' }
  if (status === 'expired') return { tone: 'red', label: 'scaduto' }
  if (!expiry) return { tone: 'green', label: null }
  const d = daysUntil(expiry)
  if (d < 0) return { tone: 'red', label: 'scaduto' }
  if (d === 0) return { tone: 'red', label: 'oggi' }
  if (d === 1) return { tone: 'red', label: 'domani' }
  if (d <= 7) return { tone: 'red', label: `tra ${d} gg` }
  if (d <= 30) return { tone: 'yellow', label: `tra ${d} gg` }
  return { tone: 'green', label: `tra ${d} gg` }
}

function valueLabel(v: Voucher): string {
  if (v.is_percentage) return `${formatNumber(Number(v.amount))}%`
  return formatCurrency(v.amount, v.currency)
}

export function VoucherCard({ voucher, person, onClick, onChanged }: Props) {
  const meta = voucherMeta(voucher.type)
  const u = urgency(voucher.expiry_date, voucher.status)
  const isUsed = voucher.status === 'used'
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleCopy(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (!voucher.code) return
    try {
      await navigator.clipboard.writeText(voucher.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore — non blocchiamo l'utente se il browser nega clipboard
    }
  }

  async function handleMarkUsed(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await supabase
        .from('vouchers')
        .update({ status: 'used' })
        .eq('id', voucher.id)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      variant="surface"
      padding="sm"
      radius="lg"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={`flex items-center gap-3 ${isUsed ? 'opacity-60' : ''}`}
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
          {person && ` · ${person.display_name}`}
        </div>
        <div className="mt-0.5 truncate text-[15px] font-bold leading-tight text-ink">
          {voucher.issuer}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
          <span className="font-semibold text-ink">{valueLabel(voucher)}</span>
          {voucher.expiry_date && (
            <>
              <span>·</span>
              <span>scade {formatDate(voucher.expiry_date)}</span>
            </>
          )}
          {!voucher.expiry_date && voucher.status === 'available' && (
            <>
              <span>·</span>
              <span>senza scadenza</span>
            </>
          )}
        </div>
        {voucher.code && (
          <div className="mt-1.5 flex items-center gap-2">
            <code className="truncate rounded-lg bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold tracking-wider text-ink">
              {voucher.code}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full bg-[color:var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft hover:text-ink"
            >
              {copied ? '✓ copiato' : 'copia'}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        {u.label && (
          <Badge tone={u.tone} size="sm">
            {u.label}
          </Badge>
        )}
        {!isUsed && voucher.status !== 'expired' && (
          <button
            type="button"
            onClick={handleMarkUsed}
            disabled={busy}
            className="rounded-full bg-[color:var(--surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft hover:text-ink disabled:opacity-50"
          >
            ✓ usato
          </button>
        )}
      </div>
    </Card>
  )
}
