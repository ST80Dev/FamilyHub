import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Family, FamilyMember } from '../types'

export interface UseFamilyResult {
  family: Family | null
  membership: FamilyMember | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useFamily(): UseFamilyResult {
  const { user } = useAuth()
  const [family, setFamily] = useState<Family | null>(null)
  const [membership, setMembership] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setFamily(null)
      setMembership(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      const { data: members, error: mErr } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: true })
        .limit(1)

      if (cancelled) return
      if (mErr) {
        setError(mErr.message)
        setLoading(false)
        return
      }
      const m = members?.[0] ?? null
      setMembership(m)

      if (!m) {
        setFamily(null)
        setLoading(false)
        return
      }

      const { data: fam, error: fErr } = await supabase
        .from('families')
        .select('*')
        .eq('id', m.family_id)
        .single()

      if (cancelled) return
      if (fErr) {
        setError(fErr.message)
        setLoading(false)
        return
      }
      setFamily(fam)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user, tick])

  return {
    family,
    membership,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  }
}
