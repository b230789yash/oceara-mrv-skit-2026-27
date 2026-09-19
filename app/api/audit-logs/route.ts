import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  if (!supabase) return NextResponse.json([], { status: 200 })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([], { status: 200 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json([], { status: 200 })

    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, resource_type, resource_id, user_email, details, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('audit_logs fetch error:', error)
      return NextResponse.json([], { status: 200 })
    }
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('audit-logs API error:', e)
    return NextResponse.json([], { status: 200 })
  }
}
