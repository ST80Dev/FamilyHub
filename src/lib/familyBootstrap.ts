import { supabase } from './supabase'
import type { Family } from '../types'

const DEFAULT_FAMILY_NAME = 'La mia famiglia'

/**
 * Crea una nuova famiglia per l'utente corrente. La RPC `create_family`
 * inserisce sia la famiglia sia il `family_member` owner via
 * SECURITY DEFINER, evitando il fallimento RLS che si avrebbe con un
 * INSERT diretto + RETURNING (PostgreSQL valuta la SELECT policy del
 * RETURNING prima che l'AFTER trigger crei la membership).
 */
export async function createFamily(
  name?: string | null,
  displayName?: string | null,
): Promise<Family> {
  const { data, error } = await supabase.rpc('create_family', {
    p_name: (name ?? '').trim() || DEFAULT_FAMILY_NAME,
    p_display_name: displayName?.trim() || undefined,
  })
  if (error) throw error
  if (!data) throw new Error('create_family non ha restituito dati')
  return data as Family
}
