import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'

interface Props {
  children: ReactNode
  requireFamily?: boolean
}

export function RequireAuth({ children, requireFamily = true }: Props) {
  const { user, loading } = useAuth()
  const { family, loading: famLoading } = useFamily()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />
  if (requireFamily) {
    if (famLoading) return null
    if (!family) return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}
