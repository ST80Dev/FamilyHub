import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { Button } from '../components/ui/Button'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { family, membership, loading } = useFamily()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">FamilyHub</h1>
          {family ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {family.name}
              {membership?.role === 'owner' && (
                <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900 dark:text-sky-200">
                  owner
                </span>
              )}
            </p>
          ) : (
            !loading && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Modalità personale
              </p>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/famiglia"
            className="text-sm text-sky-600 hover:underline dark:text-sky-400"
          >
            Famiglia
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Esci
          </Button>
        </div>
      </header>

      {!loading && !family && (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
          <h2 className="text-sm font-medium text-sky-900 dark:text-sky-200">
            Stai usando FamilyHub da solo
          </h2>
          <p className="mt-1 text-sm text-sky-800/80 dark:text-sky-200/80">
            Puoi iniziare a tracciare scadenze e abbonamenti subito. Quando vuoi
            condividere con il resto del nucleo, configura una famiglia o
            unisciti a una esistente.
          </p>
          <div className="mt-3">
            <Link to="/famiglia">
              <Button size="sm">Configura nucleo</Button>
            </Link>
          </div>
        </section>
      )}

      {family && (
        <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Codice d'invito
          </h2>
          <p className="mt-1 font-mono text-2xl tracking-[0.3em]">
            {family.invite_code}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Condividi questo codice con gli altri membri della famiglia per farli
            accedere agli stessi dati.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Connesso come <span className="font-medium">{user?.email}</span>. <br />
        La timeline delle scadenze e gli abbonamenti del mese arriveranno nelle
        prossime PR.
      </section>
    </main>
  )
}
