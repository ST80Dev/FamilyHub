import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Person } from '../types'

export interface UseSelfPersonResult {
  person: Person | null
  loading: boolean
}

/**
 * Restituisce la persona "Io" dell'utente loggato (quella con
 * `linked_user_id = auth.uid()`). È la fonte di verità per nome e avatar
 * mostrati in topbar/dashboard: `family_members.display_name` non è
 * affidabile perché in passato veniva sovrascritto al volo dall'auto-create
 * famiglia con il nome di un'altra persona.
 */
export function useSelfPerson(): UseSelfPersonResult {
  const { user } = useAuth()
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPerson(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data } = await supabase
        .from('persons')
        .select('*')
        .eq('linked_user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
      if (cancelled) return
      setPerson(data?.[0] ?? null)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  return { person, loading }
}
