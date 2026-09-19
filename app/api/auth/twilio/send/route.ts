import { NextResponse } from 'next/server'
import twilio from 'twilio'

/**
 * POST /api/auth/twilio/send
 * Body: { phone: string } (E.164 e.g. +919876543210)
 * Sends OTP via Twilio Verify. Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
 */
export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_VERIFY_SID

  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json(
      { error: 'Twilio Verify not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID (or TWILIO_VERIFY_SID).' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    let phone = (body.phone || '').trim().replace(/\D/g, '')
    if (phone.length === 10 && !phone.startsWith('91')) phone = '91' + phone
    if (!phone.startsWith('+')) phone = '+' + phone
    if (phone.length < 12) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const client = twilio(accountSid, authToken)
    await client.verify.v2.services(serviceSid).verifications.create({
      to: phone,
      channel: 'sms',
    })
    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (e: any) {
    console.error('Twilio send OTP error:', e)
    return NextResponse.json(
      { error: e.message || 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
