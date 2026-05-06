import type { BillingCycle, SubscriptionCategory } from '../types'
import type { IconTileTone } from '../components/ui/IconTile'

export interface SubscriptionMeta {
  label: string
  icon: string
  tone: IconTileTone
}

export const SUBSCRIPTION_META: Record<SubscriptionCategory, SubscriptionMeta> = {
  streaming:      { label: 'Streaming',      icon: '🎬', tone: 'peach' },
  musica:         { label: 'Musica',         icon: '🎧', tone: 'mint' },
  gaming:         { label: 'Gaming',         icon: '🎮', tone: 'lilac' },
  software:       { label: 'Software',       icon: '💻', tone: 'sky' },
  palestra:       { label: 'Palestra',       icon: '🏋️', tone: 'mint' },
  parcheggio:     { label: 'Parcheggio',     icon: '🅿️', tone: 'lemon' },
  assicurazione:  { label: 'Assicurazione',  icon: '🛡️', tone: 'sky' },
  telefonia:      { label: 'Telefonia',      icon: '📱', tone: 'pink' },
  internet:       { label: 'Internet',       icon: '📶', tone: 'sky' },
  giornali:       { label: 'Giornali',       icon: '📰', tone: 'lemon' },
  cloud_storage:  { label: 'Cloud storage',  icon: '☁️', tone: 'sky' },
  altro:          { label: 'Altro',          icon: '💳', tone: 'lilac' },
}

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = Object.keys(
  SUBSCRIPTION_META,
) as SubscriptionCategory[]

export function subscriptionMeta(c: SubscriptionCategory): SubscriptionMeta {
  return SUBSCRIPTION_META[c] ?? SUBSCRIPTION_META.altro
}

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'mensile',
  quarterly: 'trimestrale',
  semiannual: 'semestrale',
  annual: 'annuale',
}

export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
}

/** Importo normalizzato a costo mensile equivalente. */
export function monthlyEquivalent(amount: number, cycle: BillingCycle): number {
  return amount / BILLING_CYCLE_MONTHS[cycle]
}
