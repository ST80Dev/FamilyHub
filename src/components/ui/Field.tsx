import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-[color:var(--candy-peach-2)]">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-soft">
          {hint}
        </span>
      ) : null}
    </label>
  )
}

const inputBase =
  'block w-full rounded-2xl px-4 py-2.5 text-sm font-medium bg-[color:var(--surface)] text-ink placeholder:text-ink-soft/60 clay-inset border border-[color:var(--line)] focus:outline-none focus:border-[color:var(--candy-peach-2)] transition-colors'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export function Input({ invalid, className = '', ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={`${inputBase} ${invalid ? 'border-[color:var(--candy-peach-2)]' : ''} ${className}`}
    />
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export function Textarea({ invalid, className = '', rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      {...rest}
      className={`${inputBase} ${invalid ? 'border-[color:var(--candy-peach-2)]' : ''} resize-y ${className}`}
    />
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export function Select({ invalid, className = '', children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={`${inputBase} appearance-none pr-10 ${invalid ? 'border-[color:var(--candy-peach-2)]' : ''} ${className}`}
    >
      {children}
    </select>
  )
}
