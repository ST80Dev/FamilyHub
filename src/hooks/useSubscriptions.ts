import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFamily } from './useFamily'
import type { Subscription } from '../types'

export interface UseSubscriptionsResult {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useSubscriptions(): UseSubscriptionsResult {
  const { family } = useFamily()
  const [data, setData] = useState<Subscription[]>([])
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
        .from('subscriptions')
        .select('*')
        .eq('family_id', family.id)
        .order('next_billing_date', { ascending: true, nullsFirst: false })

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
    subscriptions: family ? data : [],
    loading: family ? loading : false,
    error: family ? error : null,
    refresh,
  }
}
