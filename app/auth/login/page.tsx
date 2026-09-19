'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PhoneOTPAuth from '@/components/PhoneOTPAuth'
import TwilioPhoneAuth from '@/components/TwilioPhoneAuth'
import FixedGoogleOAuth from '@/components/FixedGoogleOAuth'
import toast, { Toaster } from 'react-hot-toast'
import { authService, DEMO_CREDENTIALS } from '@/lib/simpleAuth'
// Removed old Google Auth service import

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roleParam = searchParams.get('role')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'social'>('email')
  const [loading, setLoading] = useState(false)
  const [twilioConfigured, setTwilioConfigured] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (loginMethod === 'phone') {
      fetch('/api/auth/twilio/status')
        .then((r) => r.json())
        .then((d) => setTwilioConfigured(d.configured === true))
        .catch(() => setTwilioConfigured(false))
    }
  }, [loginMethod])

  const roleNames = {
    landowner: 'Project Owner',
    buyer: 'Institution / Program',
    admin: 'MRV Administrator',
    super_admin: 'Super Admin'
  }

  const roleName = roleParam ? roleNames[roleParam as keyof typeof roleNames] : 'User'

  // Handle OAuth errors
  useEffect(() => {
    const error = searchParams.get('error')
    const description = searchParams.get('description')
    const details = searchParams.get('details')
    
    if (error) {
      console.error('🔗 OAuth Error Details:', { error, description, details })
      
      let errorMessage = 'Google authentication failed. '
      
      switch (error) {
        case 'access_denied':
          errorMessage += 'You denied access to the application.'
          break
        case 'invalid_request':
          errorMessage += 'Invalid request. Please try again.'
          break
        case 'token_exchange_failed':
          errorMessage += 'Failed to exchange authorization code for tokens.'
          break
        case 'user_info_failed':
          errorMessage += 'Failed to fetch user information.'
          break
        case 'no_code':
          errorMessage += 'No authorization code received from Google.'
          break
        case 'processing_error':
          errorMessage += 'An error occurred during processing.'
          break
        default:
          errorMessage += description || 'Please try again.'
      }
      
      if (details) {
        errorMessage += ` Details: ${details}`
      }
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 8000
      })
      
      // Clean up URL parameters
      window.history.replaceState({}, '', '/auth/login')
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try simple auth first (for demo users)
      const user = authService.login(email, password)
      
      if (user) {
        // Normalize role param (admin -> administrator)
        const normalizedRoleParam = roleParam === 'admin' ? 'administrator' : roleParam
        
        // Check if role matches (if specified)
        if (normalizedRoleParam && user.role !== normalizedRoleParam) {
          toast.error(`This account is not a ${roleParam}. Please use the correct login page.`)
          authService.logout()
          setLoading(false)
          return
        }
        
        toast.success(`Welcome back, ${user.name}!`, { duration: 3500 })
        
        // Redirect based on user's role
        setTimeout(() => {
          if (user.role === 'landowner') router.push('/landowner')
          else if (user.role === 'buyer') router.push('/buyer')
          else if (user.role === 'administrator' || user.role === 'super_admin') router.push('/admin')
          else router.push('/')
        }, 500)
        return
      }

      // If simple auth fails, try Supabase (for real users)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update profile role if needed
      if (roleParam && data.user) {
        await supabase
          .from('profiles')
          .update({ role: roleParam })
          .eq('id', data.user.id)
      }

      toast.success('Login successful!')
      
      // Redirect based on role
      setTimeout(() => {
        if (roleParam === 'landowner') router.push('/landowner')
        else if (roleParam === 'buyer') router.push('/buyer')
        else if (roleParam === 'admin') router.push('/admin')
        else router.push('/')
      }, 500)
    } catch (error: any) {
      toast.error('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Google login is now handled by SimpleGoogleLogin component

  const handlePhoneSuccess = () => {
    toast.success('Phone verification successful!')
    setTimeout(() => {
      if (roleParam === 'landowner') router.push('/landowner')
      else if (roleParam === 'buyer') router.push('/buyer')
      else if (roleParam === 'admin') router.push('/admin')
      else router.push('/')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
              🌊 Oceara
            </h1>
          </Link>
          <p className="text-gray-300">
            Login as <span className="text-white font-semibold">{roleName}</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Tab Selector */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📧 Email
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📱 Phone
            </button>
            <button
              onClick={() => setLoginMethod('social')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                loginMethod === 'social'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🔗 Social
            </button>
          </div>

          {/* Email Login */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          )}

          {/* Phone Login - Twilio if configured, else Firebase */}
          {loginMethod === 'phone' && (
            <>
              {twilioConfigured === true && (
                <TwilioPhoneAuth role={roleParam || 'user'} onSuccess={() => handlePhoneSuccess()} />
              )}
              {twilioConfigured === false && (
                <PhoneOTPAuth role={roleParam || 'user'} onSuccess={handlePhoneSuccess} />
              )}
              {twilioConfigured === null && (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}

          {/* Social Login */}
          {loginMethod === 'social' && (
            <div className="space-y-3">
              <FixedGoogleOAuth loginRole={roleParam} />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/50 text-gray-400">or use email</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-all"
              >
                📧 Login with Email
              </button>
            </div>
          )}

          {/* Pilot / test credentials for current role */}
          {roleParam && DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS] && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔑</div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">Pilot credentials</h4>
                  <p className="text-gray-300 text-xs mb-3">
                    Use these to sign in as {roleName} for testing or pilots:
                  </p>
                  <div className="bg-black/30 rounded-lg p-3 space-y-2">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Email:</div>
                      <div className="text-blue-300 font-mono text-sm flex items-center justify-between">
                        <span>{DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS].email}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS].email)
                            toast.success('Email copied!', { icon: '📋' })
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Password:</div>
                      <div className="text-blue-300 font-mono text-sm flex items-center justify-between">
                        <span>{DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS].password}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS].password)
                            toast.success('Password copied!', { icon: '📋' })
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 Copy and paste these credentials above to login
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                href={`/auth/signup?role=${roleParam}`}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
