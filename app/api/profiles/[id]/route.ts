import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { role, marketplace_access, phone } = body as { role?: string; marketplace_access?: boolean; phone?: string }
    const id = params.id

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (role !== undefined) updates.role = role
    if (marketplace_access !== undefined) updates.marketplace_access = marketplace_access
    if (phone !== undefined) updates.phone = String(phone).trim()

    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select('id, email, full_name, role, marketplace_access, phone').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('profiles PATCH error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
