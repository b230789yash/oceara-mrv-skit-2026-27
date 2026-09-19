'use client'

/**
 * Disclaimer for carbon/credit numbers. Transparent, verification-focused.
 */
export default function CarbonDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-400 italic ${className}`}>
      AI-assisted preliminary estimate. Estimates are indicative and subject to verification.
    </p>
  )
}
