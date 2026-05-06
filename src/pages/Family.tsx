import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { supabase } from '../lib/supabase'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card, Field, Input } from '../components/ui'

type Mode = 'create' | 'join'

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

  if (authLoading || famLoading) return null
  if (!user) return <Navigate to="/signin" replace />

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: insErr } = await supabase
        .from('families')
        .insert({ name: familyName.trim() })
        .select('id')
        .single()
      if (insErr) throw insErr
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
