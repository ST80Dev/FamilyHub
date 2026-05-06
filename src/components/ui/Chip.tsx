import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  glass?: boolean
  dotColor?: string
  children: ReactNode
}

export function Chip({
  glass = false,
  dotColor,
  className = '',
  children,
  ...rest
}: Props) {
  const base = glass
    ? 'bg-white/70 backdrop-blur text-[color:var(--candy-ink)]'
    : 'bg-[color:var(--surface-2)] text-ink-soft clay-sm'
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${base} ${className}`}
    >
      {dotColor && (
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: dotColor }}
        />
      )}
      {children}
    </span>
  )
}
