import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Card, Field, Input } from '../components/ui'

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
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-3xl text-3xl candy-peach-grad clay-sm text-[color:var(--candy-ink)]"
            aria-hidden
          >
            🏡
          </span>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-ink">
            FamilyHub
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Scadenze, abbonamenti e promemoria della famiglia in un posto solo.
          </p>
        </div>

        <Card variant="surface" padding="lg" radius="xl">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl p-1 clay-inset">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setError(null)
                setInfo(null)
              }}
              className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
                mode === 'signin'
                  ? 'candy-peach-grad text-white clay-sm'
                  : 'text-ink-soft hover:text-ink'
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
              className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'candy-peach-grad text-white clay-sm'
                  : 'text-ink-soft hover:text-ink'
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
              <div className="rounded-2xl bg-[color:var(--candy-peach)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-2xl bg-[color:var(--candy-mint)]/30 px-3 py-2 text-sm text-[color:var(--candy-ink)]">
                {info}
              </div>
            )}

            <Button type="submit" loading={submitting} fullWidth size="lg">
              {mode === 'signin' ? 'Accedi' : 'Crea account'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
