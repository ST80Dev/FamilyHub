import type { Subscription } from '../types'
import { daysUntil, todayISO, type ISODate } from './deadlineEngine'
import { monthlyEquivalent } from './subscriptionMeta'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseISO(d: ISODate): Date {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

function toISO(d: Date): ISODate {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Aggiunge `n` mesi a `d`. Se il giorno non esiste nel mese di destinazione
 *  (es. 31 gennaio + 1 mese), viene riportato all'ultimo giorno valido. */
export function addMonthsISO(d: ISODate, n: number): ISODate {
  if (!ISO_DATE_RE.test(d)) throw new Error(`Data non valida: ${d}`)
  const src = parseISO(d)
  const day = src.getUTCDate()
  const target = new Date(Date.UTC(src.getUTCFullYear(), src.getUTCMonth() + n, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return toISO(target)
}

export function lastDayOfMonthISO(year: number, monthIndex: number): ISODate {
  const d = new Date(Date.UTC(year, monthIndex + 1, 0))
  return toISO(d)
}

export function firstDayOfCurrentMonth(today: ISODate = todayISO()): ISODate {
  const t = parseISO(today)
  return toISO(new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1)))
}

/** Data entro cui l'utente deve comunicare la disdetta:
 *  `planned_end_date - cancellation_notice_days`. Se non c'è preavviso o non
 *  è impostata la data di fine, ritorna `null`. */
export function cancellationNoticeDate(s: Subscription): ISODate | null {
  if (!s.planned_end_date) return null
  const notice = s.cancellation_notice_days ?? 0
  if (notice <= 0) return s.planned_end_date
  const end = parseISO(s.planned_end_date)
  end.setUTCDate(end.getUTCDate() - notice)
  return toISO(end)
}

export type CancellationStatus =
  | { kind: 'none' }
  | { kind: 'pending'; end: ISODate; noticeDate: ISODate; daysToNotice: number }
  | { kind: 'urgent'; end: ISODate; noticeDate: ISODate; daysToNotice: number }
  | { kind: 'overdue_notice'; end: ISODate; noticeDate: ISODate }
  | { kind: 'expired'; end: ISODate }

/** Stato della disdetta pianificata, calcolato in client.
 *  - `none`: nessuna disdetta programmata.
 *  - `expired`: la data di fine è già passata (l'abbonamento dovrebbe essere
 *    disdetto, lo stato è ancora `active` per qualche motivo).
 *  - `overdue_notice`: la finestra di preavviso è passata ma l'abbonamento non
 *    è ancora finito → urgenza massima per disdire.
 *  - `urgent`: mancano ≤ `urgentWindowDays` giorni alla data limite per disdire.
 *  - `pending`: data programmata ma fuori finestra urgente. */
export function cancellationStatus(
  s: Subscription,
  today: ISODate = todayISO(),
  urgentWindowDays = 30,
): CancellationStatus {
  if (!s.planned_end_date) return { kind: 'none' }
  const end = s.planned_end_date
  const daysToEnd = daysUntil(end, today)
  if (daysToEnd < 0) return { kind: 'expired', end }
  const noticeDate = cancellationNoticeDate(s) ?? end
  const daysToNotice = daysUntil(noticeDate, today)
  if (daysToNotice < 0) return { kind: 'overdue_notice', end, noticeDate }
  if (daysToNotice <= urgentWindowDays)
    return { kind: 'urgent', end, noticeDate, daysToNotice }
  return { kind: 'pending', end, noticeDate, daysToNotice }
}

/** L'abbonamento contribuisce ancora alla spesa mensile? Esclude solo i casi
 *  in cui la fine programmata è interamente nel passato (mese precedente o
 *  prima): in questi casi il rinnovo non avverrà più. */
export function contributesToCurrentMonth(
  s: Subscription,
  today: ISODate = todayISO(),
): boolean {
  if (s.status !== 'active') return false
  if (!s.planned_end_date) return true
  return s.planned_end_date >= firstDayOfCurrentMonth(today)
}

/** Importo mensile equivalente, già azzerato quando l'abbonamento non
 *  contribuisce più al mese corrente. */
export function effectiveMonthlyAmount(
  s: Subscription,
  today: ISODate = todayISO(),
): number {
  if (!contributesToCurrentMonth(s, today)) return 0
  return monthlyEquivalent(Number(s.amount) || 0, s.billing_cycle)
}
