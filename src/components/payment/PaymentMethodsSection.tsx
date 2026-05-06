import { useState } from 'react'
import { Button, Card } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import { useFamily } from '../../hooks/useFamily'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { recordOwnership } from '../../lib/ownership'
import {
  PAYMENT_METHOD_ICON,
  PAYMENT_METHOD_LABEL,
} from '../../lib/paymentMethodMeta'
import { PaymentMethodForm } from './PaymentMethodForm'
import type { PaymentMethod } from '../../types'

export function PaymentMethodsSection() {
  const { user } = useAuth()
  const { family } = useFamily()
  const { paymentMethods, loading, refresh } = usePaymentMethods()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)

  if (!user) return null
  const scope = recordOwnership(family, user.id)

  return (
    <Card variant="surface" padding="lg" radius="xl" className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Metodi di pagamento
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Carte e conti per associare scadenze e abbonamenti.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
          + Nuovo
        </Button>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-ink-soft">Caricamento…</div>
      )}

      {!loading && paymentMethods.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          Nessun metodo registrato. Aggiungine uno per vedere il riepilogo
          settimanale degli addebiti.
        </p>
      )}

      {!loading && paymentMethods.length > 0 && (
        <ul className="mt-4 space-y-2">
          {paymentMethods.map((pm) => (
            <li key={pm.id}>
              <button
                type="button"
                onClick={() => setEditing(pm)}
                className="flex w-full items-center gap-3 rounded-2xl bg-[color:var(--surface-2)] px-3 py-2.5 text-left clay-sm transition hover:scale-[1.01]"
              >
                <span className="text-2xl" aria-hidden>
                  {PAYMENT_METHOD_ICON[pm.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-ink">
                      {pm.label}
                    </span>
                    {pm.is_default && (
                      <span className="rounded-full bg-[color:var(--candy-mint)]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                        Predefinito
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-ink-soft">
                    {PAYMENT_METHOD_LABEL[pm.type]}
                    {pm.issuer ? ` · ${pm.issuer}` : ''}
                    {pm.last4 ? ` · ··${pm.last4}` : ''}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <PaymentMethodForm
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={refresh}
        scope={scope}
        initial={editing}
      />
    </Card>
  )
}
