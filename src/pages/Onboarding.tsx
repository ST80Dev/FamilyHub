import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'

type Mode = 'create' | 'join'

export default function Onboarding() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { family, loading: famLoading, refresh } = useFamily()
  const [mode, setMode] = useState<Mode>('create')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authLoading || famLoading) return null
  if (!user) return <Navigate to="/signin" replace />
  if (family) return <Navigate to="/" replace />

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

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Benvenuto in FamilyHub</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Crea il tuo nucleo familiare oppure unisciti a uno esistente con il
            codice d'invito.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-slate-200 p-1 text-sm dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('create')
              setError(null)
            }}
            className={`rounded-md py-2 font-medium transition-colors ${
              mode === 'create'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
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
            className={`rounded-md py-2 font-medium transition-colors ${
              mode === 'join'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
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
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
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
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
              disabled={inviteCode.trim().length !== 8}
            >
              Unisciti
            </Button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Connesso come <span className="font-medium">{user.email}</span>.{' '}
          <button onClick={signOut} className="underline hover:text-slate-700 dark:hover:text-slate-300">
            Esci
          </button>
        </div>
      </div>
    </main>
  )
}
