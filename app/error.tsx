'use client'

import Link from 'next/link'

/**
 * Catches errors in this segment so the rest of the app can still work.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-900">
      <div className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">
          This page could not load. Try again or go back home.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            Go home
          </Link>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/20"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
