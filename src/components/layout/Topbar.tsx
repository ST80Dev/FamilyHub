import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFamily } from '../../hooks/useFamily'
import { Avatar } from '../ui'

export function Topbar() {
  const { user } = useAuth()
  const { family, membership } = useFamily()

  return (
    <header className="md:hidden flex items-center justify-between px-1 py-2">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-[46px] w-[46px] place-items-center rounded-2xl text-2xl candy-peach-grad clay-sm text-[color:var(--candy-ink)]">
          🏡
        </span>
        <div className="leading-tight">
          <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
            FamilyHub
          </h1>
          <p className="text-xs font-medium text-ink-soft">
            {family ? family.name : 'modalità personale'}
          </p>
        </div>
      </Link>
      <Link to="/impostazioni" aria-label="Impostazioni">
        <Avatar name={membership?.display_name} email={user?.email} size="md" />
      </Link>
    </header>
  )
}
