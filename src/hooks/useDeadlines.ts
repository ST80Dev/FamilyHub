import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useFamily } from './useFamily'
import type { Deadline } from '../types'

export interface UseDeadlinesResult {
  deadlines: Deadline[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDeadlines(): UseDeadlinesResult {
  const { user } = useAuth()
  const { family } = useFamily()
  const [data, setData] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      const filter = family
        ? `family_id.eq.${family.id},owner_user_id.eq.${user.id}`
        : `owner_user_id.eq.${user.id}`
      const { data, error: e } = await supabase
        .from('deadlines')
        .select('*')
        .or(filter)
        .order('due_date', { ascending: true })

      if (cancelled) return
      if (e) setError(e.message)
      else setData(data ?? [])
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user, family, tick])

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  return {
    deadlines: user ? data : [],
    loading: user ? loading : false,
    error: user ? error : null,
    refresh,
  }
}
