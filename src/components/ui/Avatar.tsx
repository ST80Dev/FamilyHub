import type { HTMLAttributes } from 'react'

type Size = 'sm' | 'md' | 'lg'

interface Props extends HTMLAttributes<HTMLDivElement> {
  name?: string | null
  email?: string | null
  size?: Size
}

const sizes: Record<Size, string> = {
  sm: 'w-9 h-9 text-xs rounded-xl',
  md: 'w-[46px] h-[46px] text-sm rounded-2xl',
  lg: 'w-14 h-14 text-base rounded-[20px]',
}

function initials(name?: string | null, email?: string | null): string {
  const src = (name ?? email ?? '').trim()
  if (!src) return '·'
  const parts = src.split(/[\s@._-]+/).filter(Boolean)
  if (parts.length === 0) return '·'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
}

export function Avatar({
  name,
  email,
  size = 'md',
  className = '',
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      className={`grid place-items-center font-extrabold text-[color:var(--candy-ink)] candy-lilac-grad clay-sm ${sizes[size]} ${className}`}
      style={{
        background:
          'linear-gradient(135deg, var(--candy-lilac), var(--candy-sky))',
      }}
    >
      {initials(name, email)}
    </div>
  )
}
