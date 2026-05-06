export const THEMES = ['pesca', 'rosa', 'blu', 'verde', 'giallo', 'scuro'] as const
export type Theme = (typeof THEMES)[number]

export const STORAGE_KEY = 'fh-theme'
export const DEFAULT_THEME: Theme = 'pesca'

export const THEME_META_COLOR: Record<Theme, string> = {
  pesca: '#FFB39E',
  rosa: '#F4A6C0',
  blu: '#80BFE3',
  verde: '#7FD3AE',
  giallo: '#FFD16B',
  scuro: '#2A2422',
}
