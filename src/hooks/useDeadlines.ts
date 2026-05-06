import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFamily } from './useFamily'
import type { Deadline } from '../types'

export interface UseDeadlinesResult {
  deadlines: Deadline[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDeadlines(): UseDeadlinesResult {
  const { family } = useFamily()
  const [data, setData] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!family) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    ;(async () => {
      const { data, error: e } = await supabase
        .from('deadlines')
        .select('*')
        .eq('family_id', family.id)
        .order('due_date', { ascending: true })

      if (cancelled) return
      if (e) setError(e.message)
      else setData(data ?? [])
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [family, tick])

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  return {
    deadlines: family ? data : [],
    loading: family ? loading : false,
    error: family ? error : null,
    refresh,
  }
}
