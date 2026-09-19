import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  if (!supabase) return NextResponse.json([], { status: 200 })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([], { status: 200 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json([], { status: 403 })

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, marketplace_access, phone')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('profiles fetch error:', error)
      return NextResponse.json([], { status: 200 })
    }
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('profiles API error:', e)
    return NextResponse.json([], { status: 200 })
  }
}
