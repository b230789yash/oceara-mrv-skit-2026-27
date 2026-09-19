'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SimpleGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = () => {
    try {
      setIsLoading(true)
      
      // Simple Google OAuth URL approach
      const clientId = '187601325863-45db1i9onqndts56g42ccub6gf0onqss.apps.googleusercontent.com'
      
      // Use production URL if available, otherwise localhost
      const isLocalhost = window.location.hostname === 'localhost'
      const redirectUri = isLocalhost 
        ? encodeURIComponent('http://localhost:3000/auth/callback')
        : encodeURIComponent('https://oceara-web-platform.vercel.app/auth/callback')
      
      const scope = encodeURIComponent('openid email profile')
      
      const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code&` +
        `access_type=offline`
      
      console.log('🔗 Redirecting to Google OAuth:', googleAuthUrl)
      console.log('📍 Current origin:', window.location.origin)
      console.log('🔑 Client ID:', clientId.substring(0, 20) + '...')
      
      // Show success message
      toast.success('Redirecting to Google OAuth...', { icon: '🔗' })
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl
    } catch (error) {
      console.error('❌ Google OAuth error:', error)
      toast.error('Failed to initiate Google OAuth', { icon: '❌' })
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 
        bg-white hover:bg-gray-50 disabled:bg-gray-100
        border-2 border-gray-200 hover:border-gray-300
        rounded-xl text-gray-800 font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  )
}
