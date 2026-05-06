import type { PaymentMethod, PaymentMethodType } from '../types'

export const PAYMENT_METHOD_TYPES: PaymentMethodType[] = [
  'credit_card',
  'debit_card',
  'bank_account',
  'other',
]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodType, string> = {
  credit_card: 'Carta di credito',
  debit_card: 'Carta di debito',
  bank_account: 'Conto corrente',
  other: 'Altro',
}

export const PAYMENT_METHOD_ICON: Record<PaymentMethodType, string> = {
  credit_card: '💳',
  debit_card: '💳',
  bank_account: '🏦',
  other: '💰',
}

export function paymentMethodLabel(pm: PaymentMethod): string {
  if (pm.last4) return `${pm.label} ··${pm.last4}`
  return pm.label
}
