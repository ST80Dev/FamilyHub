import { Link, NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:gap-6 md:p-6">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl candy-peach-grad clay-sm text-[color:var(--candy-ink)]">
          🏡
        </span>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">
            FamilyHub
          </h1>
          <p className="text-xs text-ink-soft">scadenze condivise</p>
        </div>
      </Link>

      <nav aria-label="Navigazione laterale" className="clay rounded-[28px] p-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[color:var(--surface-2)] text-ink clay-inset'
                      : 'text-ink-soft hover:text-ink hover:bg-[color:var(--surface-2)]'
                  }`
                }
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl text-base">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <NavLink
          to="/impostazioni"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ${
              isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
            }`
          }
        >
          <span className="text-base">⚙️</span>
          Impostazioni
        </NavLink>
      </div>
    </aside>
  )
}
