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
import { authService } from '@/lib/simpleAuth'
// Removed old Google Auth service import

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roleParam = searchParams.get('role')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone' | 'social'>('email')
  const [loading, setLoading] = useState(false)
  const [twilioConfigured, setTwilioConfigured] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (signupMethod === 'phone') {
      fetch('/api/auth/twilio/status')
        .then((r) => r.json())
        .then((d) => setTwilioConfigured(d.configured === true))
        .catch(() => setTwilioConfigured(false))
    }
  }, [signupMethod])

  const roleNames = {
    landowner: 'Project Owner',
    buyer: 'Institution / Program',
    admin: 'MRV Administrator',
    super_admin: 'Super Admin'
  }

  const roleName = roleParam ? roleNames[roleParam as keyof typeof roleNames] : 'User'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to terms and conditions')
      return
    }

    setLoading(true)
    try {
      // Create user with simple auth
      const user = authService.signup(
        formData.email,
        formData.password,
        formData.fullName,
        roleParam || 'buyer'
      )

      toast.success(`Welcome, ${user.name}!`, { duration: 3500 })
      
      // Auto-login and redirect
      setTimeout(() => {
        if (user.role === 'landowner') router.push('/landowner')
        else if (user.role === 'buyer') router.push('/buyer')
        else if (user.role === 'administrator' || user.role === 'super_admin') router.push('/admin')
        else router.push('/')
      }, 1000)
      
      // Also try to create in Supabase (optional)
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: roleParam || 'user',
            },
          },
        })

        if (!error && data.user) {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: roleParam || 'user',
            })
        }
      } catch (supabaseError) {
        // Ignore Supabase errors, simple auth is working
        console.log('Supabase signup skipped:', supabaseError)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  // Google signup is now handled by SimpleGoogleLogin component

  const handlePhoneSuccess = () => {
    toast.success('Account created successfully!')
    setTimeout(() => {
      if (roleParam === 'landowner') router.push('/landowner')
      else if (roleParam === 'buyer') router.push('/buyer')
      else if (roleParam === 'admin') router.push('/admin')
      else router.push('/')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 mb-2">
              🌊 Oceara
            </h1>
          </Link>
          <p className="text-gray-300">
            Create your <span className="text-white font-semibold">{roleName}</span> account
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Tab Selector */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setSignupMethod('email')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                signupMethod === 'email'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📧 Email
            </button>
            <button
              onClick={() => setSignupMethod('phone')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                signupMethod === 'phone'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📱 Phone
            </button>
            <button
              onClick={() => setSignupMethod('social')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                signupMethod === 'social'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🔗 Social
            </button>
          </div>

          {/* Email Signup */}
          {signupMethod === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>
              
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mr-3 mt-1 rounded"
                  required
                />
                <label className="text-gray-300 text-sm">
                  I agree to the{' '}
                  <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-emerald-500 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Phone Signup */}
          {signupMethod === 'phone' && (
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

          {/* Social Signup */}
          {signupMethod === 'social' && (
            <div className="space-y-3">
              <FixedGoogleOAuth />

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
                onClick={() => setSignupMethod('email')}
                className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-all"
              >
                📧 Sign up with Email
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                href={`/auth/login?role=${roleParam}`}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Login
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
