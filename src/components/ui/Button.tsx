import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'candy-peach-grad text-white clay hover:brightness-105 active:translate-y-px disabled:opacity-50',
  secondary:
    'clay text-ink hover:brightness-[1.02] active:translate-y-px disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-soft hover:text-ink hover:bg-[color:var(--surface-2)]',
  danger:
    'candy-red-grad text-white clay hover:brightness-105 active:translate-y-px disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-2xl',
  md: 'h-11 px-5 text-sm rounded-2xl',
  lg: 'h-13 px-6 text-base rounded-[20px] py-3.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-[filter,transform,background] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
