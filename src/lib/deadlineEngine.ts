/**
 * Logica italiana per il calcolo delle scadenze burocratiche.
 * Funzioni pure: dato un input (persona/veicolo + data di emissione) restituiscono
 * la data di scadenza calcolata secondo la normativa italiana.
 *
 * Tutte le date sono ISO `YYYY-MM-DD`.
 */

export type ISODate = string

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseISO(d: ISODate): Date {
  if (!ISO_DATE_RE.test(d)) throw new Error(`Data non valida: ${d}`)
  const [y, m, day] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

function toISO(d: Date): ISODate {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addYears(d: Date, years: number): Date {
  const r = new Date(d)
  r.setUTCFullYear(r.getUTCFullYear() + years)
  return r
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d)
  const targetMonth = r.getUTCMonth() + months
  r.setUTCMonth(targetMonth)
  return r
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + days)
  return r
}

/** Restituisce una data ISO spostata di N giorni rispetto al riferimento. */
export function shiftISO(date: ISODate, days: number): ISODate {
  return toISO(addDays(parseISO(date), days))
}

/** Età compiuta in anni a una data di riferimento (default oggi). */
export function ageAt(birthDate: ISODate, ref: ISODate = todayISO()): number {
  const b = parseISO(birthDate)
  const r = parseISO(ref)
  let age = r.getUTCFullYear() - b.getUTCFullYear()
  const before =
    r.getUTCMonth() < b.getUTCMonth() ||
    (r.getUTCMonth() === b.getUTCMonth() && r.getUTCDate() < b.getUTCDate())
  if (before) age--
  return age
}

export function todayISO(): ISODate {
  const now = new Date()
  return toISO(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  )
}

export function daysUntil(date: ISODate, ref: ISODate = todayISO()): number {
  const a = parseISO(date).getTime()
  const b = parseISO(ref).getTime()
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}

/**
 * Patente di guida (B):
 *  - < 50 anni: validità 10 anni
 *  - 50–69 anni: validità 5 anni
 *  - >= 70 anni: validità 3 anni
 *  Calcolata sull'età alla data di rilascio.
 */
export function patenteExpiry(
  issueDate: ISODate,
  birthDate: ISODate,
): ISODate {
  const ageAtIssue = ageAt(birthDate, issueDate)
  const years = ageAtIssue >= 70 ? 3 : ageAtIssue >= 50 ? 5 : 10
  return toISO(addYears(parseISO(issueDate), years))
}

/**
 * Carta d'Identità Elettronica:
 *  - adulto: 10 anni
 *  - 3–17 anni: 5 anni
 *  - < 3 anni: 3 anni
 */
export function cieExpiry(issueDate: ISODate, birthDate: ISODate): ISODate {
  const ageAtIssue = ageAt(birthDate, issueDate)
  const years = ageAtIssue < 3 ? 3 : ageAtIssue < 18 ? 5 : 10
  return toISO(addYears(parseISO(issueDate), years))
}

/**
 * Passaporto:
 *  - adulto (>= 18): 10 anni
 *  - minore: 5 anni
 */
export function passaportoExpiry(
  issueDate: ISODate,
  birthDate: ISODate,
): ISODate {
  const ageAtIssue = ageAt(birthDate, issueDate)
  const years = ageAtIssue >= 18 ? 10 : 5
  return toISO(addYears(parseISO(issueDate), years))
}

export type SpidProvider = 'aruba' | 'poste' | 'tim' | 'altro'

/**
 * SPID:
 *  - Aruba: 3 anni dall'attivazione (richiede rinnovo)
 *  - Poste / TIM: nessuna scadenza (a vita)
 *  - altro: assumiamo 2 anni (default cautelativo)
 */
export function spidExpiry(
  activationDate: ISODate,
  provider: SpidProvider,
): ISODate | null {
  if (provider === 'poste' || provider === 'tim') return null
  const years = provider === 'aruba' ? 3 : 2
  return toISO(addYears(parseISO(activationDate), years))
}

/**
 * Esenzione ticket sanitario: scade ogni anno il 31 marzo.
 * Restituisce il prossimo 31 marzo a partire da `ref`.
 */
export function esenzioneTicketExpiry(ref: ISODate = todayISO()): ISODate {
  const r = parseISO(ref)
  const year = r.getUTCFullYear()
  const thisYear = new Date(Date.UTC(year, 2, 31))
  return toISO(thisYear >= r ? thisYear : new Date(Date.UTC(year + 1, 2, 31)))
}

/**
 * Bollo auto: scade l'ultimo giorno del mese di immatricolazione,
 * dopo 12 mesi dall'ultimo pagamento (o dall'immatricolazione la prima volta).
 *
 * @param firstRegistration data di prima immatricolazione (per primo bollo)
 * @param lastPaid data dell'ultimo pagamento (se presente)
 */
export function bolloAutoExpiry(
  firstRegistration: ISODate,
  lastPaid?: ISODate,
): ISODate {
  const base = parseISO(lastPaid ?? firstRegistration)
  const next = addYears(base, 1)
  // ultimo giorno del mese
  const lastDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  )
  return toISO(lastDay)
}

/**
 * Revisione auto:
 *  - prima revisione: 4 anni dopo l'immatricolazione
 *  - successive: ogni 2 anni
 */
export function revisioneAutoExpiry(
  firstRegistration: ISODate,
  lastRevision?: ISODate,
): ISODate {
  if (!lastRevision) {
    return toISO(addYears(parseISO(firstRegistration), 4))
  }
  return toISO(addYears(parseISO(lastRevision), 2))
}

/** Assicurazione auto/casa: rinnovo annuale dalla data di stipula. */
export function assicurazioneAnnualExpiry(
  startDate: ISODate,
  ref: ISODate = todayISO(),
): ISODate {
  let next = addYears(parseISO(startDate), 1)
  const r = parseISO(ref)
  while (next < r) next = addYears(next, 1)
  return toISO(next)
}

/**
 * IMU: due rate fisse annuali — acconto 16 giugno, saldo 16 dicembre.
 * Restituisce la prossima rata a partire da `ref`.
 */
export function imuNextDueDate(ref: ISODate = todayISO()): ISODate {
  const r = parseISO(ref)
  const year = r.getUTCFullYear()
  const acconto = new Date(Date.UTC(year, 5, 16))
  const saldo = new Date(Date.UTC(year, 11, 16))
  if (r <= acconto) return toISO(acconto)
  if (r <= saldo) return toISO(saldo)
  return toISO(new Date(Date.UTC(year + 1, 5, 16)))
}

/** Dichiarazione dei redditi (modello 730): 30 settembre di ogni anno. */
export function redditi730DueDate(ref: ISODate = todayISO()): ISODate {
  const r = parseISO(ref)
  const year = r.getUTCFullYear()
  const due = new Date(Date.UTC(year, 8, 30))
  return toISO(due >= r ? due : new Date(Date.UTC(year + 1, 8, 30)))
}

/** Garanzia legale prodotti: 24 mesi dalla data di acquisto (D.lgs. 24/2002 + Codice del Consumo). */
export function warrantyExpiry(
  purchaseDate: ISODate,
  warrantyMonths = 24,
  extendedMonths = 0,
): ISODate {
  return toISO(
    addMonths(parseISO(purchaseDate), warrantyMonths + extendedMonths),
  )
}

/**
 * Calcola il prossimo addebito di un abbonamento ricorrente.
 */
export function nextBillingDate(
  startDate: ISODate,
  cycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual',
  ref: ISODate = todayISO(),
): ISODate {
  const monthsByCycle: Record<typeof cycle, number> = {
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    annual: 12,
  }
  const step = monthsByCycle[cycle]
  let next = parseISO(startDate)
  const r = parseISO(ref)
  while (next < r) next = addMonths(next, step)
  return toISO(next)
}

/** Categorizza una scadenza per urgenza, secondo la dashboard FamilyHub. */
export type UrgencyBucket = 'overdue' | 'within7' | 'within30' | 'within60' | 'later'

export function urgencyBucket(
  dueDate: ISODate,
  ref: ISODate = todayISO(),
): UrgencyBucket {
  const d = daysUntil(dueDate, ref)
  if (d < 0) return 'overdue'
  if (d <= 7) return 'within7'
  if (d <= 30) return 'within30'
  if (d <= 60) return 'within60'
  return 'later'
}
