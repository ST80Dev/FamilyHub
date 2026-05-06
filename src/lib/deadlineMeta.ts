import type { DeadlineType } from '../types'
import type { IconTileTone } from '../components/ui/IconTile'

export interface DeadlineMeta {
  label: string
  icon: string
  tone: IconTileTone
  category: string
}

export const DEADLINE_META: Record<DeadlineType, DeadlineMeta> = {
  bollo_auto:           { label: 'Bollo auto',          icon: '🚗', tone: 'peach',  category: 'Veicoli' },
  revisione_auto:       { label: 'Revisione auto',      icon: '🛠️', tone: 'mint',   category: 'Veicoli' },
  patente:              { label: 'Patente',             icon: '🪪', tone: 'lemon',  category: 'Documenti' },
  cie:                  { label: 'Carta d’identità', icon: '🪪', tone: 'lilac', category: 'Documenti' },
  passaporto:           { label: 'Passaporto',          icon: '📘', tone: 'sky',    category: 'Documenti' },
  spid:                 { label: 'SPID',                icon: '🔐', tone: 'sky',    category: 'Documenti' },
  esenzione_ticket:     { label: 'Esenzione ticket',    icon: '🩺', tone: 'mint',   category: 'Salute' },
  ricetta_medica:       { label: 'Ricetta medica',      icon: '💊', tone: 'pink',   category: 'Salute' },
  visita_medica:        { label: 'Visita medica',       icon: '👨‍⚕️', tone: 'pink', category: 'Salute' },
  assicurazione_auto:   { label: 'Assicurazione auto',  icon: '🚙', tone: 'peach',  category: 'Veicoli' },
  assicurazione_casa:   { label: 'Assicurazione casa',  icon: '🏠', tone: 'lilac',  category: 'Casa' },
  contratto_affitto:    { label: 'Contratto affitto',   icon: '🔑', tone: 'lemon',  category: 'Casa' },
  dichiarazione_redditi:{ label: 'Dichiarazione redditi', icon: '📄', tone: 'sky',  category: 'Tasse' },
  imu:                  { label: 'IMU',                 icon: '🏠', tone: 'lilac',  category: 'Tasse' },
  tari:                 { label: 'TARI',                icon: '🗑️', tone: 'mint',   category: 'Tasse' },
  f24:                  { label: 'F24',                 icon: '🧾', tone: 'lemon',  category: 'Tasse' },
  custom:               { label: 'Promemoria',          icon: '📌', tone: 'pink',   category: 'Altro' },
}

export const DEADLINE_TYPES: DeadlineType[] = Object.keys(
  DEADLINE_META,
) as DeadlineType[]

export function deadlineMeta(type: DeadlineType): DeadlineMeta {
  return DEADLINE_META[type] ?? DEADLINE_META.custom
}
