import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'

type Mode = 'signin' | 'signup'

export default function SignIn() {
  const { user, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        const { needsEmailConfirmation } = await signUp(email, password)
        if (needsEmailConfirmation) {
          setInfo(
            `Ti abbiamo inviato un'email di conferma a ${email}. Cliccala per attivare l'account.`,
          )
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di autenticazione')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">FamilyHub</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Scadenze, abbonamenti e promemoria della famiglia in un posto solo.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-slate-200 p-1 text-sm dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError(null)
              setInfo(null)
            }}
            className={`rounded-md py-2 font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError(null)
              setInfo(null)
            }}
            className={`rounded-md py-2 font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            Registrati
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field
            label="Password"
            hint={mode === 'signup' ? 'Minimo 6 caratteri.' : undefined}
          >
            <Input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              {info}
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full" size="lg">
            {mode === 'signin' ? 'Accedi' : 'Crea account'}
          </Button>
        </form>
      </div>
    </main>
  )
}
