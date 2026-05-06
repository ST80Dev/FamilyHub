import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { supabase } from '../lib/supabase'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Field, Input } from '../components/ui'

type Mode = 'create' | 'join'

interface PersonalCounts {
  deadlines: number
  subscriptions: number
  warranties: number
  vouchers: number
  home_maintenance: number
  persons: number
  vehicles: number
  pets: number
}

const COUNT_LABELS: Record<keyof PersonalCounts, [string, string]> = {
  deadlines: ['scadenza', 'scadenze'],
  subscriptions: ['abbonamento', 'abbonamenti'],
  warranties: ['garanzia', 'garanzie'],
  vouchers: ['buono', 'buoni'],
  home_maintenance: ['manutenzione', 'manutenzioni'],
  persons: ['persona', 'persone'],
  vehicles: ['veicolo', 'veicoli'],
  pets: ['animale', 'animali'],
}

async function countPersonal(userId: string): Promise<PersonalCounts> {
  const tables: (keyof PersonalCounts)[] = [
    'deadlines', 'subscriptions', 'warranties', 'vouchers',
    'home_maintenance', 'persons', 'vehicles', 'pets',
  ]
  const counts: PersonalCounts = {
    deadlines: 0, subscriptions: 0, warranties: 0, vouchers: 0,
    home_maintenance: 0, persons: 0, vehicles: 0, pets: 0,
  }
  await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true })
        .eq('owner_user_id', userId)
      counts[t] = count ?? 0
    }),
  )
  return counts
}

function totalCount(c: PersonalCounts): number {
  return Object.values(c).reduce((a, b) => a + b, 0)
}

function formatPersonalSummary(c: PersonalCounts): string {
  const parts: string[] = []
  for (const k of Object.keys(c) as (keyof PersonalCounts)[]) {
    const n = c[k]
    if (n === 0) continue
    const [singular, plural] = COUNT_LABELS[k]
    parts.push(`${n} ${n === 1 ? singular : plural}`)
  }
  return parts.join(', ')
}

export default function Family() {
  const { user, loading: authLoading } = useAuth()
  const { family, membership, loading: famLoading, refresh } = useFamily()
  const [mode, setMode] = useState<Mode>('create')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [pendingPromotion, setPendingPromotion] = useState<{
    familyId: string
    counts: PersonalCounts
  } | null>(null)
  const [promoting, setPromoting] = useState(false)
  const [promoted, setPromoted] = useState<string | null>(null)

  // After joining/creating, see if user still has personal records to promote.
  useEffect(() => {
    if (!user || !family) return
    if (pendingPromotion?.familyId === family.id) return
    if (promoted === family.id) return
    let cancelled = false
    ;(async () => {
      const counts = await countPersonal(user.id)
      if (cancelled) return
      if (totalCount(counts) > 0) {
        setPendingPromotion({ familyId: family.id, counts })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, family, pendingPromotion, promoted])

  if (authLoading || famLoading) return null
  if (!user) return <Navigate to="/signin" replace />

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: rpcErr } = await supabase.rpc('create_family', {
        p_name: familyName.trim(),
      })
      if (rpcErr) throw rpcErr
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore creazione famiglia')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: rpcErr } = await supabase.rpc('join_family_by_code', {
        code: inviteCode.trim().toUpperCase(),
        name: displayName.trim() || (user?.email ?? 'Membro'),
      })
      if (rpcErr) throw rpcErr
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore accesso famiglia')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyInvite() {
    if (!family?.invite_code) return
    await navigator.clipboard.writeText(family.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handlePromote() {
    if (!pendingPromotion) return
    setPromoting(true)
    setError(null)
    try {
      const { error: rpcErr } = await supabase.rpc(
        'promote_personal_to_family',
        { target_family: pendingPromotion.familyId },
      )
      if (rpcErr) throw rpcErr
      setPromoted(pendingPromotion.familyId)
      setPendingPromotion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore condivisione')
    } finally {
      setPromoting(false)
    }
  }

  function dismissPromotion() {
    if (!pendingPromotion) return
    setPromoted(pendingPromotion.familyId)
    setPendingPromotion(null)
  }

  if (family) {
    return (
      <AppShell>
        <div className="md:mt-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Famiglia
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Gestione del nucleo e inviti.
          </p>
        </div>

        {pendingPromotion && (
          <Card variant="surface" padding="lg" radius="xl" className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Condividere i record personali col nucleo?
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Hai {formatPersonalSummary(pendingPromotion.counts)} che ora sono
              solo tuoi. Vuoi spostarli in <strong>{family.name}</strong> così
              che li veda tutto il nucleo?
            </p>
            {error && (
              <div className="mt-3 rounded-2xl bg-[color:var(--candy-peach)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
                {error}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" loading={promoting} onClick={handlePromote}>
                Sì, condividi tutto
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={promoting}
                onClick={dismissPromotion}
              >
                No, tienili miei
              </Button>
            </div>
          </Card>
        )}

        <Card variant="surface" padding="lg" radius="xl" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                {family.name}
              </h2>
              {membership?.role === 'owner' && (
                <span className="mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider candy-lemon-grad text-[color:var(--candy-ink)]">
                  Owner
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card variant="surface" padding="lg" radius="xl" className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Codice d'invito
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <p className="font-display text-3xl font-bold tracking-[0.3em] text-ink">
              {family.invite_code}
            </p>
            <Button variant="secondary" size="sm" onClick={copyInvite}>
              {copied ? 'Copiato' : 'Copia'}
            </Button>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Condividi questo codice con gli altri membri della famiglia per farli
            accedere agli stessi dati.
          </p>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="md:mt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Configura il nucleo
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Crea una famiglia per condividere scadenze e abbonamenti, oppure
          unisciti a una esistente con il codice d'invito.
        </p>
      </div>

      <Card variant="surface" padding="lg" radius="xl" className="mt-6">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl p-1 clay-inset">
          <button
            type="button"
            onClick={() => {
              setMode('create')
              setError(null)
            }}
            className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
              mode === 'create'
                ? 'candy-peach-grad text-white clay-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Crea famiglia
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('join')
              setError(null)
            }}
            className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
              mode === 'join'
                ? 'candy-peach-grad text-white clay-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Unisciti
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Nome della famiglia" hint="Es. Famiglia Rossi.">
              <Input
                required
                maxLength={60}
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </Field>
            {error && (
              <div className="rounded-2xl bg-[color:var(--candy-peach)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={!familyName.trim()}
            >
              Crea famiglia
            </Button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <Field
              label="Codice d'invito"
              hint="8 caratteri, te lo passa chi ha già creato la famiglia."
            >
              <Input
                required
                maxLength={8}
                minLength={8}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
              />
            </Field>
            <Field label="Il tuo nome" hint="Come ti vedranno gli altri membri.">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.email ?? ''}
              />
            </Field>
            {error && (
              <div className="rounded-2xl bg-[color:var(--candy-peach)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={inviteCode.trim().length !== 8}
            >
              Unisciti
            </Button>
          </form>
        )}
      </Card>
    </AppShell>
  )
}
