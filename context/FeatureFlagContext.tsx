'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/lib/simpleAuth'
import { canSeeAdvancedFeatures } from '@/lib/featureFlags'

interface FeatureFlagContextType {
  canSeeAdvancedFeatures: boolean
  userEmail: string | null
  loading: boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const [demoEmail, setDemoEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.email) {
      setDemoEmail(null)
      setLoading(false)
      return
    }
    try {
      const demoUser = authService.getCurrentUser()
      setDemoEmail(demoUser?.email ?? null)
    } catch {
      setDemoEmail(null)
    }
    setLoading(false)
  }, [user?.email])

  let userEmail = user?.email ?? demoEmail
  let role: string | null = user?.user_metadata?.role ?? profile?.role ?? null
  let marketplaceAccess: boolean = profile?.marketplace_access ?? false
  try {
    const demoUser = authService.getCurrentUser()
    userEmail = user?.email ?? demoEmail ?? demoUser?.email ?? null
    if (!role) role = demoUser?.role ?? null
  } catch {
    // localStorage or auth not available - use defaults
  }
  const advanced = canSeeAdvancedFeatures(userEmail ?? undefined, role, marketplaceAccess)

  return (
    <FeatureFlagContext.Provider
      value={{
        canSeeAdvancedFeatures: advanced,
        userEmail,
        loading,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}
