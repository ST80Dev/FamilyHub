import type { Person, PersonKind } from '../types'

export const PERSON_KIND_LABEL: Record<PersonKind, string> = {
  human: 'Persona',
  pet: 'Animale',
}

export const HUMAN_AVATARS = ['👤', '👨', '👩', '🧑', '👦', '👧', '👴', '👵', '🧔', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳']

export const PET_AVATARS = ['🐶', '🐱', '🐰', '🐹', '🐭', '🐦', '🦜', '🐢', '🐠', '🐟', '🦎', '🐍', '🐴', '🐮', '🐷', '🐑']

export function defaultAvatarFor(kind: PersonKind): string {
  return kind === 'pet' ? '🐶' : '👤'
}

export function personAvatar(p: Pick<Person, 'kind' | 'avatar_emoji'>): string {
  return p.avatar_emoji?.trim() || defaultAvatarFor(p.kind)
}
