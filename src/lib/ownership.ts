import type { Family } from '../types'

export interface RecordScope {
  family_id: string | null
  owner_user_id: string | null
}

/**
 * Returns the scope columns to write on a new record given the current
 * family/user context. Records are family-scoped if a family is active,
 * otherwise they belong to the user. Mutually exclusive (DB CHECK constraint).
 */
export function recordOwnership(
  family: Family | null,
  userId: string | null,
): RecordScope {
  if (family) {
    return { family_id: family.id, owner_user_id: null }
  }
  if (userId) {
    return { family_id: null, owner_user_id: userId }
  }
  throw new Error('recordOwnership requires either a family or a user')
}
