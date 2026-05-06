import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="clay relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col rounded-[28px]"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="font-display shrink-0 px-5 pb-3 pt-5 text-xl font-bold tracking-tight text-ink">
            {title}
          </h2>
        )}
        <div className={`overflow-y-auto px-5 ${title ? 'pb-5' : 'py-5'}`}>
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-[color:var(--line)] px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
