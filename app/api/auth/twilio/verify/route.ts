import { NextResponse } from 'next/server'
import twilio from 'twilio'

/**
 * POST /api/auth/twilio/verify
 * Body: { phone: string, code: string }
 * Verifies OTP via Twilio Verify. Returns success and optional user payload for session.
 */
export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_VERIFY_SID

  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json(
      { error: 'Twilio Verify not configured.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const code = (body.code || '').trim()
    let phone = (body.phone || '').trim().replace(/\D/g, '')
    if (phone.length === 10 && !phone.startsWith('91')) phone = '91' + phone
    if (!phone.startsWith('+')) phone = '+' + phone
    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    const client = twilio(accountSid, authToken)
    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: phone,
      code,
    })
    if (check.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      phone,
      message: 'Verified',
    })
  } catch (e: any) {
    console.error('Twilio verify OTP error:', e)
    return NextResponse.json(
      { error: e.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
