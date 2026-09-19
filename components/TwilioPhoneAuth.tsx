'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface TwilioPhoneAuthProps {
  role: string
  onSuccess: (phone: string) => void
}

function formatPhoneForDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return `+91 ${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2)}`
  return value
}

function formatPhoneForApi(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return '+91' + digits
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits
  return value.startsWith('+') ? value : '+' + value
}

// E.164: +countrycode then 6–15 digits
function isValidInternationalPhone(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone)
}

export default function TwilioPhoneAuth({ role, onSuccess }: TwilioPhoneAuthProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpInputs = ([] as (HTMLInputElement | null)[]).concat(Array(6).fill(null))

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    const formatted = formatPhoneForApi(phoneNumber)
    if (!isValidInternationalPhone(formatted)) {
      toast.error('Use international format: +countrycode then number (e.g. +91 9876543210)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/twilio/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP')
        return
      }
      setStep('otp')
      setCountdown(60)
      toast.success('OTP sent to your phone!')
    } catch (e) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) (document.querySelectorAll('.twilio-otp-input')[index + 1] as HTMLInputElement)?.focus()
    if (index === 5 && value && newOtp.join('').length === 6) handleVerifyOTP(newOtp.join(''))
  }

  const handleVerifyOTP = async (code?: string) => {
    const codeStr = code || otp.join('')
    if (codeStr.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }
    const formatted = formatPhoneForApi(phoneNumber)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/twilio/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted, code: codeStr }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Invalid OTP')
        return
      }
      toast.success('Verified!')
      // Save to profile when user is authenticated
      try {
        const profileRes = await fetch('/api/profiles/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formatted }),
        })
        if (profileRes.ok) {
          toast.success('Phone number saved to your profile.', { duration: 3000 })
        } else if (profileRes.status === 401) {
          // Not signed in; phone verified but not saved
          toast('Sign in to save this number to your profile.', { duration: 3500, icon: '📱' })
        } else {
          const err = await profileRes.json().catch(() => ({}))
          toast.error(err.error || 'Could not save phone number')
        }
      } catch {
        toast.error('Could not save phone number')
      }
      onSuccess(formatted)
    } catch (e) {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div>
          <label className="block text-white mb-2 font-semibold">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="10-digit mobile number"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            maxLength={10}
          />
          <p className="text-xs text-gray-400 mt-1">We'll add +91 for India</p>
        </div>
        <button
          onClick={handleSendOTP}
          disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending OTP...' : '📱 Send OTP via Twilio'}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <label className="block text-white font-semibold">Enter 6-digit OTP</label>
          <button type="button" onClick={() => { setStep('phone'); setOtp(['','','','','','']) }} className="text-blue-400 hover:text-blue-300 text-sm">← Change Number</button>
        </div>
        <p className="text-gray-300 text-sm mb-4">Sent to {formatPhoneForDisplay(phoneNumber)}</p>
        <div className="flex gap-2 justify-center mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              className="twilio-otp-input w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOTPChange(i, e.target.value)}
            />
          ))}
        </div>
        {countdown > 0 && <p className="text-center text-gray-400 text-sm">Resend in {countdown}s</p>}
      </div>
      <button
        onClick={() => handleVerifyOTP()}
        disabled={loading || otp.join('').length !== 6}
        className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white disabled:opacity-50"
      >
        {loading ? 'Verifying...' : '✓ Verify OTP'}
      </button>
    </motion.div>
  )
}
