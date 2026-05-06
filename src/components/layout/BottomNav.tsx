import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export function BottomNav() {
  return (
    <nav
      aria-label="Navigazione principale"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
    >
      <div className="clay grid grid-cols-5 gap-1 rounded-[28px] p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-ink' : 'text-ink-soft'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={`grid h-9 w-9 place-items-center rounded-2xl text-base transition-all ${
                    isActive
                      ? 'candy-peach-grad clay-inset text-[color:var(--candy-ink)]'
                      : 'bg-transparent'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.shortLabel ?? item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
