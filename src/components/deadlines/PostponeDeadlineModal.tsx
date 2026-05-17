import { useState } from 'react'
import { Button, Field, Input, Modal } from '../ui'
import { supabase } from '../../lib/supabase'
import { shiftISO, todayISO } from '../../lib/deadlineEngine'
import { formatDate } from '../../lib/format'
import type { Deadline } from '../../types'

interface Props {
  open: boolean
  deadline: Deadline | null
  onClose: () => void
  onSaved?: () => void
}

interface Preset {
  label: string
  days: number
}

const PRESETS: Preset[] = [
  { label: '+1 settimana', days: 7 },
  { label: '+2 settimane', days: 14 },
  { label: '+1 mese', days: 30 },
  { label: '+3 mesi', days: 90 },
]

export function PostponeDeadlineModal({
  open,
  deadline,
  onClose,
  onSaved,
}: Props) {
  const [customDate, setCustomDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function applyDate(newDate: string) {
    if (!deadline || busy) return
    setBusy(true)
    setError(null)
    const { error: e } = await supabase
      .from('deadlines')
      .update({ due_date: newDate })
      .eq('id', deadline.id)
    setBusy(false)
    if (e) {
      setError(e.message)
      return
    }
    setCustomDate('')
    onSaved?.()
    onClose()
  }

  function applyPreset(days: number) {
    const today = todayISO()
    void applyDate(shiftISO(today, days))
  }

  function applyCustom() {
    if (!customDate) return
    if (customDate < todayISO()) {
      setError('Scegli una data futura.')
      return
    }
    void applyDate(customDate)
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) {
          setCustomDate('')
          setError(null)
          onClose()
        }
      }}
      title="Posponi scadenza"
    >
      {deadline && (
        <>
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">
              {deadline.title?.trim() || 'Scadenza'}
            </span>{' '}
            · scadeva il {formatDate(deadline.due_date)}.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.days}
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => applyPreset(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="mt-5">
            <Field label="Oppure scegli una data">
              <Input
                type="date"
                value={customDate}
                min={todayISO()}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </Field>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                disabled={!customDate || busy}
                loading={busy}
                onClick={applyCustom}
              >
                Sposta a {customDate ? formatDate(customDate) : '…'}
              </Button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
          )}
        </>
      )}
    </Modal>
  )
}
