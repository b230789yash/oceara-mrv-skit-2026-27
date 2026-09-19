import { NextResponse } from 'next/server'

/** GET /api/auth/twilio/status - Check if Twilio Verify is configured (client can use for showing phone option). */
export async function GET() {
  const configured =
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!(process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_VERIFY_SID)
  return NextResponse.json({ configured })
}
