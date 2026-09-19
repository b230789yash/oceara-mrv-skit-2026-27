'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export interface FixedGoogleOAuthProps {
  /** Role to redirect after login: landowner, buyer, or admin */
  loginRole?: string | null
}

export default function FixedGoogleOAuth(props: FixedGoogleOAuthProps) {
  const { loginRole: role } = props
  const [isLoading, setIsLoading] = useState(false)
  const [clientId, setClientId] = useState<string>('')
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
    setClientId(envClientId)
    setIsConfigured(!!envClientId?.trim())
  }, [])

  const handleGoogleLogin = () => {
    if (!isConfigured || !clientId?.trim()) {
      toast.error('Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment.', {
        icon: '❌',
        duration: 5000
      })
      return
    }

    setIsLoading(true)
    try {
      // Use canonical URL from env so you only register ONE redirect URI in Google Console (e.g. production).
      // Google will redirect to this URL; callback then can send user back to current origin if different.
      const canonicalOrigin = typeof process.env.NEXT_PUBLIC_APP_URL === 'string' && process.env.NEXT_PUBLIC_APP_URL.trim()
        ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
        : window.location.origin
      const redirectUri = `${canonicalOrigin}/auth/callback`
      const returnTo = window.location.origin
      const roleToUse = role === 'landowner' || role === 'buyer' || role === 'admin' ? role : 'admin'
      const state = encodeURIComponent(JSON.stringify({ r: returnTo, role: roleToUse, s: Math.random().toString(36).substring(7) }))
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        state
      })
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      toast.success('Redirecting to Google...', { icon: '🔗', duration: 2000 })
      window.location.href = googleAuthUrl
    } catch (error) {
      console.error('OAuth Error:', error)
      toast.error('Failed to start Google sign-in. Please try again.', { icon: '❌', duration: 5000 })
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 
          bg-white hover:bg-gray-50 disabled:bg-gray-100
          border-2 border-gray-200 hover:border-gray-300
          rounded-xl text-gray-800 font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>
      {!isConfigured && (
        <p className="text-center text-xs text-gray-400">
          Add <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
        </p>
      )}
      {isConfigured && (
        <p className="text-center text-xs text-gray-400">
          OAuth configured • Click to sign in
        </p>
      )}
    </div>
  )
}
