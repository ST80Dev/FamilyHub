import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Chip } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { usePersons } from '../hooks/usePersons'
import { useVouchers } from '../hooks/useVouchers'
import { VoucherCard } from '../components/vouchers/VoucherCard'
import { VoucherForm } from '../components/vouchers/VoucherForm'
import { daysUntil } from '../lib/deadlineEngine'
import { formatCurrency } from '../lib/format'
import { recordOwnership } from '../lib/ownership'
import type { Voucher } from '../types'

interface Buckets {
  expired: Voucher[]
  expiring: Voucher[]
  available: Voucher[]
  used: Voucher[]
}

function bucketize(vouchers: Voucher[]): Buckets {
  const out: Buckets = { expired: [], expiring: [], available: [], used: [] }
  for (const v of vouchers) {
    if (v.status === 'used') {
      out.used.push(v)
      continue
    }
    if (v.status === 'expired') {
      out.expired.push(v)
      continue
    }
    if (v.expiry_date) {
      const d = daysUntil(v.expiry_date)
      if (d < 0) {
        out.expired.push(v)
        continue
      }
      if (d <= 30) {
        out.expiring.push(v)
        continue
      }
    }
    out.available.push(v)
  }
  return out
}

export default function Vouchers() {
  const { user } = useAuth()
  const { family, loading: famLoading } = useFamily()
  const { vouchers, loading, refresh } = useVouchers()
  const { persons } = usePersons()
  const personById = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons],
  )
  const [editing, setEditing] = useState<Voucher | null>(null)
  const [creating, setCreating] = useState(false)
  const [showUsed, setShowUsed] = useState(false)

  const buckets = useMemo(() => bucketize(vouchers), [vouchers])

  const availableTotal = useMemo(() => {
    let total = 0
    for (const v of [...buckets.available, ...buckets.expiring]) {
      if (v.is_percentage) continue
      if ((v.currency || 'EUR') !== 'EUR') continue
      total += Number(v.amount) || 0
    }
    return total
  }, [buckets])

  const activeCount = buckets.available.length + buckets.expiring.length

  const issuerSuggestions = useMemo(() => {
    const set = new Map<string, string>()
    for (const v of vouchers) {
      const raw = v.issuer?.trim()
      if (!raw) continue
      const key = raw.toLowerCase()
      if (!set.has(key)) set.set(key, raw)
    }
    return Array.from(set.values()).sort((a, b) =>
      a.localeCompare(b, 'it', { sensitivity: 'base' }),
    )
  }, [vouchers])

  if (famLoading || !user) return null

  const scope = recordOwnership(family, user.id)

  return (
    <AppShell>
      <div className="flex items-center justify-between md:mt-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Buoni
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {activeCount === 0
              ? 'Nessun buono disponibile'
              : `${activeCount} ${activeCount === 1 ? 'disponibile' : 'disponibili'}`}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          + Nuovo
        </Button>
      </div>

      {!family && (
        <Card variant="surface" padding="md" className="mt-4">
          <p className="text-sm text-ink-soft">
            Stai usando FamilyHub da solo. I buoni che aggiungi sono tuoi.{' '}
            <Link to="/famiglia" className="font-semibold text-ink underline">
              Crea o unisciti a una famiglia
            </Link>{' '}
            per condividerli col nucleo.
          </p>
        </Card>
      )}

      <Card variant="hero" padding="lg" radius="xl" className="mt-5">
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-80">
            Da spendere
          </div>
          <div className="font-display mt-1 text-[42px] font-bold leading-none">
            {formatCurrency(availableTotal)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip glass dotColor="var(--candy-peach-2)">
              {activeCount}{' '}
              {activeCount === 1 ? 'disponibile' : 'disponibili'}
            </Chip>
            {buckets.expiring.length > 0 && (
              <Chip glass>
                {buckets.expiring.length} in scadenza ≤30gg
              </Chip>
            )}
          </div>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -left-5 h-24 w-24 rounded-full bg-white/25"
        />
      </Card>

      {loading && (
        <div className="mt-8 text-center text-sm text-ink-soft">
          Caricamento…
        </div>
      )}

      {!loading && vouchers.length === 0 && (
        <Card variant="surface" padding="lg" className="mt-6 text-center">
          <div className="mb-3 text-4xl" aria-hidden>🎁</div>
          <h2 className="font-display text-xl font-bold text-ink">
            Nessun buono ancora
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Buoni regalo, rimborsi, cashback e coupon: salvali qui prima che
            scadano.
          </p>
          <div className="mt-4">
            <Button size="sm" onClick={() => setCreating(true)}>
              + Aggiungi buono
            </Button>
          </div>
        </Card>
      )}

      {!loading && buckets.expired.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
            Scaduti{' '}
            <span className="text-sm font-medium text-ink-soft">
              · {buckets.expired.length}
            </span>
          </h2>
          <div className="space-y-3">
            {buckets.expired.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                person={v.person_id ? personById.get(v.person_id) : null}
                onClick={() => setEditing(v)}
                onChanged={refresh}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && buckets.expiring.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
            In scadenza{' '}
            <span className="text-sm font-medium text-ink-soft">
              · {buckets.expiring.length}
            </span>
          </h2>
          <div className="space-y-3">
            {buckets.expiring.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                person={v.person_id ? personById.get(v.person_id) : null}
                onClick={() => setEditing(v)}
                onChanged={refresh}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && buckets.available.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-lg font-bold text-ink">
            Disponibili{' '}
            <span className="text-sm font-medium text-ink-soft">
              · {buckets.available.length}
            </span>
          </h2>
          <div className="space-y-3">
            {buckets.available.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                person={v.person_id ? personById.get(v.person_id) : null}
                onClick={() => setEditing(v)}
                onChanged={refresh}
              />
            ))}
          </div>
        </section>
      )}

      {buckets.used.length > 0 && (
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setShowUsed((v) => !v)}
            className="flex w-full items-center justify-between px-1 text-left"
          >
            <h2 className="font-display text-lg font-bold text-ink">
              Usati{' '}
              <span className="text-sm font-medium text-ink-soft">
                · {buckets.used.length}
              </span>
            </h2>
            <span aria-hidden className="text-xl leading-none text-ink-soft">
              {showUsed ? '−' : '+'}
            </span>
          </button>
          {showUsed && (
            <div className="mt-2 space-y-3">
              {buckets.used.map((v) => (
                <VoucherCard
                  key={v.id}
                  voucher={v}
                  person={v.person_id ? personById.get(v.person_id) : null}
                  onClick={() => setEditing(v)}
                  onChanged={refresh}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <VoucherForm
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={refresh}
        scope={scope}
        initial={editing}
        issuerSuggestions={issuerSuggestions}
      />
    </AppShell>
  )
}
