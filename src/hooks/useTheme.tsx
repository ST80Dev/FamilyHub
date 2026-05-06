import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  DEFAULT_THEME,
  STORAGE_KEY,
  THEMES,
  THEME_META_COLOR,
  type Theme,
} from '../lib/theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && (THEMES as readonly string[]).includes(saved)) {
      return saved as Theme
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = THEME_META_COLOR[theme]
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(t) {
        setThemeState(t)
        try {
          window.localStorage.setItem(STORAGE_KEY, t)
        } catch {
          // ignore
        }
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve stare dentro <ThemeProvider>')
  return ctx
}
