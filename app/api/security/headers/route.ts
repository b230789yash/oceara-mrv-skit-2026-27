import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    security: {
      csp: 'enabled',
      hsts: 'enabled',
      xss: 'protected',
      clickjacking: 'protected',
      contentSniffing: 'disabled',
    },
    message: 'Security headers are configured'
  })
}
