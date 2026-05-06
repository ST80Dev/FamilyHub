import type { InputHTMLAttributes, ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export function Input({ invalid, className = '', ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 ${
        invalid
          ? 'border-red-400 focus:border-red-500'
          : 'border-slate-300 focus:border-sky-500 dark:border-slate-700'
      } ${className}`}
    />
  )
}
