import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFamily } from './useFamily'
import type { FamilyMember } from '../types'

export interface UseFamilyMembersResult {
  members: FamilyMember[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useFamilyMembers(): UseFamilyMembersResult {
  const { family } = useFamily()
  const [data, setData] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!family) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      const { data, error: e } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', family.id)
        .order('joined_at', { ascending: true })

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

  return { members: data, loading, error, refresh }
}
