import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { Button } from '../components/ui/Button'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { family, membership } = useFamily()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">FamilyHub</h1>
          {family && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {family.name}
              {membership?.role === 'owner' && (
                <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900 dark:text-sky-200">
                  owner
                </span>
              )}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Esci
        </Button>
      </header>

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Codice d'invito
        </h2>
        <p className="mt-1 font-mono text-2xl tracking-[0.3em]">
          {family?.invite_code ?? '—'}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Condividi questo codice con gli altri membri della famiglia per farli
          accedere agli stessi dati.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Connesso come <span className="font-medium">{user?.email}</span>. <br />
        La timeline delle scadenze e gli abbonamenti del mese arriveranno nelle
        prossime PR.
      </section>
    </main>
  )
}
