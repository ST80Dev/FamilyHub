import type { HTMLAttributes, ReactNode } from 'react'

type Tone =
  | 'red'
  | 'yellow'
  | 'green'
  | 'sky'
  | 'lilac'
  | 'pink'
  | 'neutral'

type Size = 'sm' | 'md'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  size?: Size
  children: ReactNode
}

const tones: Record<Tone, string> = {
  red: 'candy-red-grad text-white',
  yellow: 'candy-lemon-grad text-[color:var(--candy-ink)]',
  green: 'candy-mint-grad text-[color:var(--candy-ink)]',
  sky: 'candy-sky-grad text-[color:var(--candy-ink)]',
  lilac: 'candy-lilac-grad text-[color:var(--candy-ink)]',
  pink: 'candy-pink-grad text-[color:var(--candy-ink)]',
  neutral: 'bg-[color:var(--surface-2)] text-ink-soft',
}

const sizes: Record<Size, string> = {
  sm: 'text-[10px] px-2 py-[2px]',
  md: 'text-xs px-2.5 py-1',
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 rounded-full font-bold leading-none ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
