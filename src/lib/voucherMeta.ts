import type { VoucherStatus, VoucherType } from '../types'
import type { IconTileTone } from '../components/ui/IconTile'

export interface VoucherMeta {
  label: string
  icon: string
  tone: IconTileTone
}

export const VOUCHER_META: Record<VoucherType, VoucherMeta> = {
  regalo:   { label: 'Buono regalo', icon: '🎁', tone: 'pink' },
  rimborso: { label: 'Rimborso',     icon: '💶', tone: 'mint' },
  reso:     { label: 'Reso',         icon: '📦', tone: 'lemon' },
  cashback: { label: 'Cashback',     icon: '💰', tone: 'mint' },
  coupon:   { label: 'Coupon',       icon: '🏷️', tone: 'peach' },
  altro:    { label: 'Altro',        icon: '🎟️', tone: 'lilac' },
}

export const VOUCHER_TYPES: VoucherType[] = Object.keys(
  VOUCHER_META,
) as VoucherType[]

export function voucherMeta(t: VoucherType): VoucherMeta {
  return VOUCHER_META[t] ?? VOUCHER_META.altro
}

export const VOUCHER_STATUS_LABEL: Record<VoucherStatus, string> = {
  available: 'Disponibile',
  used: 'Usato',
  expired: 'Scaduto',
}
