'use client'

/**
 * Catches errors in the root layout so the site never shows a blank screen.
 * User can refresh or go home.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e2e8f0',
        padding: 24,
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: 480,
          textAlign: 'center',
          background: 'rgba(255,255,255,0.05)',
          padding: 32,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌊</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
            The page could not load. Try refreshing or go back home.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#0ea5e9',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go home
            </button>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'transparent',
                color: '#e2e8f0',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
