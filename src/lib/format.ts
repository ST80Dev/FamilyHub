/** Formattatori italiani: date DD/MM/YYYY, valuta €, numeri con virgola. */

const dateFmt = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const currencyFmt = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
})

const numberFmt = new Intl.NumberFormat('it-IT', {
  maximumFractionDigits: 2,
})

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dateFmt.format(new Date(iso))
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = 'EUR',
): string {
  if (amount == null || amount === '') return '—'
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (currency === 'EUR') return currencyFmt.format(n)
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(n)
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return numberFmt.format(n)
}
