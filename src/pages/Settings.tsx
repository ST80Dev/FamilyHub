import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button, Card } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { THEMES } from '../lib/theme'
import type { Theme } from '../lib/theme'

const THEME_LABEL: Record<Theme, string> = {
  pesca: 'Pesca',
  rosa: 'Rosa',
  blu: 'Blu',
  verde: 'Verde',
  giallo: 'Giallo',
  scuro: 'Scuro',
}

const THEME_GRADIENT: Record<Theme, string> = {
  pesca: 'linear-gradient(135deg, #FFF1E6, #FFB39E)',
  rosa: 'linear-gradient(135deg, #FFE4EC, #F4A6C0)',
  blu: 'linear-gradient(135deg, #E3EEFB, #80BFE3)',
  verde: 'linear-gradient(135deg, #E4F4E8, #7FD3AE)',
  giallo: 'linear-gradient(135deg, #FFF6D6, #FFD16B)',
  scuro: 'linear-gradient(135deg, #3A332F, #1F1B1A)',
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <AppShell>
      <div className="md:mt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Impostazioni
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Aspetto, account e nucleo familiare.
        </p>
      </div>

      <Card variant="surface" padding="lg" radius="xl" className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink">Tema</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Scegli la palette di superficie. I colori delle scadenze restano gli
          stessi su tutti i temi.
        </p>
        <div role="radiogroup" aria-label="Tema" className="mt-4 flex flex-wrap gap-3">
          {THEMES.map((t) => {
            const active = theme === t
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(t)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`block h-12 w-12 rounded-2xl clay-sm transition-transform ${active ? 'scale-105 ring-2 ring-[color:var(--ink)] ring-offset-2 ring-offset-[color:var(--bg)]' : ''}`}
                  style={{ background: THEME_GRADIENT[t] }}
                  aria-hidden
                />
                <span className={`text-xs font-semibold ${active ? 'text-ink' : 'text-ink-soft'}`}>
                  {THEME_LABEL[t]}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card variant="surface" padding="lg" radius="xl" className="mt-4">
        <h2 className="font-display text-lg font-bold text-ink">Nucleo familiare</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Crea, gestisci o invita persone al tuo nucleo.
        </p>
        <div className="mt-3">
          <Link to="/famiglia">
            <Button size="sm" variant="secondary">Vai alla famiglia</Button>
          </Link>
        </div>
      </Card>

      <Card variant="surface" padding="lg" radius="xl" className="mt-4">
        <h2 className="font-display text-lg font-bold text-ink">Account</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Connesso come <span className="font-semibold text-ink">{user?.email}</span>
        </p>
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={signOut}>
            Esci
          </Button>
        </div>
      </Card>

      <p className="mt-8 text-center text-xs text-ink-soft">
        FamilyHub · gestione condivisa di scadenze familiari
      </p>
    </AppShell>
  )
}
