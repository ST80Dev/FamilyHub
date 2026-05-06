import type { HTMLAttributes, ReactNode } from 'react'

type Variant =
  | 'surface'
  | 'flat'
  | 'hero'
  | 'urg-red'
  | 'urg-yellow'
  | 'urg-green'
  | 'candy-peach'
  | 'candy-mint'
  | 'candy-sky'
  | 'candy-lemon'
  | 'candy-lilac'
  | 'candy-pink'

type Padding = 'none' | 'sm' | 'md' | 'lg'
type Radius = 'md' | 'lg' | 'xl' | '2xl'

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  padding?: Padding
  radius?: Radius
  children: ReactNode
}

const variants: Record<Variant, string> = {
  surface: 'clay text-ink',
  flat: 'clay-flat text-ink',
  hero: 'hero-grad text-[color:var(--candy-ink)] clay relative overflow-hidden',
  'urg-red': 'candy-red-grad text-white clay',
  'urg-yellow': 'candy-lemon-grad text-[color:var(--candy-ink)] clay',
  'urg-green': 'candy-mint-grad text-[color:var(--candy-ink)] clay',
  'candy-peach': 'candy-peach-grad text-white clay',
  'candy-mint': 'candy-mint-grad text-[color:var(--candy-ink)] clay',
  'candy-sky': 'candy-sky-grad text-[color:var(--candy-ink)] clay',
  'candy-lemon': 'candy-lemon-grad text-[color:var(--candy-ink)] clay',
  'candy-lilac': 'candy-lilac-grad text-[color:var(--candy-ink)] clay',
  'candy-pink': 'candy-pink-grad text-[color:var(--candy-ink)] clay',
}

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

const radii: Record<Radius, string> = {
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  xl: 'rounded-[28px]',
  '2xl': 'rounded-[32px]',
}

export function Card({
  variant = 'surface',
  padding = 'md',
  radius = 'lg',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      className={`${variants[variant]} ${paddings[padding]} ${radii[radius]} ${className}`}
    >
      {children}
    </div>
  )
}
