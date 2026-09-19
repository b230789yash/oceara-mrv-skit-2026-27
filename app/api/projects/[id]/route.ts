import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProjectsDatabase } from '@/lib/database/projects'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const db = new ProjectsDatabase(supabase)
    const project = await db.getProjectById(params.id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const db = new ProjectsDatabase(supabase)
    const body = await request.json()
    const project = await db.updateProject(params.id, body)
    return NextResponse.json({ project }, { status: 200 })
  } catch (error: any) {
    console.error('Error in PATCH /api/projects/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const db = new ProjectsDatabase(supabase)
    await db.deleteProject(params.id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    )
  }
}
