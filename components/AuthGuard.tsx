'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/simpleAuth'
import { motion } from 'framer-motion'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'landowner' | 'buyer' | 'administrator'
  redirectTo?: string
}

export default function AuthGuard({ children, requiredRole, redirectTo = '/auth/login' }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const user = authService.getCurrentUser()
    
    if (!user) {
      // Not logged in, redirect to login with role parameter
      const loginUrl = requiredRole ? `${redirectTo}?role=${requiredRole}` : redirectTo
      router.push(loginUrl)
      return
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      // Wrong role, redirect to appropriate dashboard or login
      if (user.role === 'landowner') {
        router.push('/landowner')
      } else if (user.role === 'buyer') {
        router.push('/buyer')
      } else if (user.role === 'administrator') {
        router.push('/admin')
      } else {
        router.push(redirectTo)
      }
      return
    }

    // All checks passed
    setIsAuthorized(true)
    setIsLoading(false)
  }, [requiredRole, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Checking authentication...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect
  }

  return <>{children}</>
}

