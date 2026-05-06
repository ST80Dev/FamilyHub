export interface NavItem {
  to: string
  label: string
  icon: string
  shortLabel?: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/scadenze', label: 'Scadenze', icon: '📅' },
  { to: '/abbonamenti', label: 'Abbonamenti', icon: '💳', shortLabel: 'Abbon.' },
  { to: '/buoni', label: 'Buoni', icon: '🎁' },
  { to: '/famiglia', label: 'Famiglia', icon: '👨‍👩‍👧' },
]
