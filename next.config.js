/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://earthengine.googleapis.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://nominatim.openstreetmap.org https://www.openstreetmap.org https://tile.openstreetmap.org",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://*.googleapis.com https://accounts.google.com https://*.supabase.co https://*.firebaseio.com https://*.firebase.com https://earthengine.googleapis.com wss://*.supabase.co https://nominatim.openstreetmap.org https://www.openstreetmap.org https://tile.openstreetmap.org",
              "frame-src 'self' https://accounts.google.com https://*.googleapis.com https://www.openstreetmap.org",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  },
  
  // Disable source maps in production to protect code
  productionBrowserSourceMaps: false,
  
  // Compress responses
  compress: true,
}

module.exports = nextConfig

