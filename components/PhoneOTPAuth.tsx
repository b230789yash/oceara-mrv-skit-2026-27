'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase'
import { ConfirmationResult } from 'firebase/auth'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

// Extend Window interface for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any
  }
}

interface PhoneOTPAuthProps {
  role: string
  onSuccess: () => void
}

export default function PhoneOTPAuth({ role, onSuccess }: PhoneOTPAuthProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [countdown, setCountdown] = useState(0)
  
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (step === 'phone' && recaptchaRef.current && !window.recaptchaVerifier && auth) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        })
      } catch (error) {
        console.error('reCAPTCHA error:', error)
      }
    }
  }, [step])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Add country code if not present
    if (digits.length === 10) {
      return '+91' + digits // India
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return '+' + digits
    }
    return value
  }

  const handleSendOTP = async () => {
    if (!auth) {
      toast.error('Phone authentication is not configured. Please use email/password login.')
      return
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setLoading(true)
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      const appVerifier = window.recaptchaVerifier
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      setStep('otp')
      setCountdown(60) // 60 second countdown
      toast.success('OTP sent to your phone!')
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.')
      } else {
        toast.error('Failed to send OTP. Please try again.')
      }
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOtp(newOTP)

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }

    // Auto-verify when all 6 digits entered
    if (index === 5 && value) {
      const fullOTP = newOTP.join('')
      if (fullOTP.length === 6) {
        handleVerifyOTP(fullOTP)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOTP = [...otp]
    
    pastedData.split('').forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOTP[index] = char
      }
    })
    
    setOtp(newOTP)
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    otpInputs.current[lastIndex]?.focus()
    
    // Auto-verify if 6 digits pasted
    if (pastedData.length === 6 && /^\d{6}$/.test(pastedData)) {
      handleVerifyOTP(pastedData)
    }
  }

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('')
    
    if (code.length !== 6) {
      toast.error('Please enter complete 6-digit OTP')
      return
    }

    if (!confirmationResult) {
      toast.error('Please request OTP first')
      return
    }

    setLoading(true)
    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(code)
      const user = result.user
      
      // Create/update profile in Supabase
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phoneNumber)
        .single()

      if (!existingProfile) {
        // Create new profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            phone: phoneNumber,
            role: role,
            full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
          })

        if (profileError) throw profileError
      }

      toast.success('Successfully authenticated!')
      onSuccess()
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.')
        setOtp(['', '', '', '', '', ''])
        otpInputs.current[0]?.focus()
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP expired. Please request a new one.')
        setStep('phone')
        setOtp(['', '', '', '', '', ''])
      } else {
        toast.error('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    setOtp(['', '', '', '', '', ''])
    setStep('phone')
    setConfirmationResult(null)
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }
    toast('Ready to resend OTP', { icon: '📱' })
  }

  return (
    <div className="space-y-6">
      {step === 'phone' ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-white mb-2 font-semibold">
              Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="10-digit mobile number"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter your 10-digit mobile number (we'll add +91)
            </p>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || phoneNumber.length < 10}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              loading || phoneNumber.length < 10
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending OTP...</span>
              </div>
            ) : (
              <>📱 Send OTP</>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-white font-semibold">
                Enter 6-Digit OTP
              </label>
              <button
                onClick={() => setStep('phone')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ← Change Number
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              OTP sent to {formatPhoneNumber(phoneNumber)}
            </p>

            {/* OTP Input Boxes */}
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {countdown > 0 && (
              <p className="text-center text-gray-400 text-sm mb-4">
                Resend OTP in {countdown}s
              </p>
            )}
          </div>

          <button
            onClick={() => handleVerifyOTP()}
            disabled={loading || otp.join('').length !== 6}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              loading || otp.join('').length !== 6
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <>✓ Verify OTP</>
            )}
          </button>

          {countdown === 0 && (
            <button
              onClick={handleResendOTP}
              className="w-full py-2 text-blue-400 hover:text-blue-300 font-semibold"
            >
              Resend OTP
            </button>
          )}
        </motion.div>
      )}

      {/* reCAPTCHA container */}
      <div ref={recaptchaRef} />
    </div>
  )
}

