import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// E.164: + followed by 6–15 digits (country code + number)
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/

export async function GET() {
  const supabase = createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, marketplace_access, phone')
      .eq('id', user.id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('profiles/me GET error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { phone } = body as { phone?: string }
    if (phone !== undefined) {
      const trimmed = String(phone).trim()
      if (!PHONE_REGEX.test(trimmed)) {
        return NextResponse.json(
          { error: 'Invalid phone. Use international format: +countrycode then number (e.g. +919876543210)' },
          { status: 400 }
        )
      }
    }
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (phone !== undefined) updates.phone = phone.trim()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('id, email, full_name, role, marketplace_access, phone')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('profiles/me PATCH error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
