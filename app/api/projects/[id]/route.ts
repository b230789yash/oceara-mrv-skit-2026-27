import { validateProjectUpdate } from '@/lib/project-validation'
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
    const body: unknown = await request.json()

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be a JSON object.' },
        { status: 400 }
      )
    }

    const updates = body as Record<string, unknown>
    const errors = validateProjectUpdate(updates)

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid project update.', errors },
        { status: 400 }
      )
    }

    const allowedFields = [
      'name',
      'owner',
      'owner_email',
      'location',
      'coordinates',
      'area',
      'credits_available',
      'price_per_credit',
      'verified',
      'status',
      'impact',
      'image',
      'description',
      'images',
      'satellite_images',
      'field_data',
      'ml_analysis',
      'documents',
    ]

    const unknownFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    )

    if (unknownFields.length > 0) {
      return NextResponse.json(
        { error: 'Unsupported project update fields.', fields: unknownFields },
        { status: 400 }
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'At least one field must be provided.' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const db = new ProjectsDatabase(supabase)
    const project = await db.updateProject(params.id, updates)

    return NextResponse.json({ project }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error in PATCH /api/projects/[id]:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Request body must contain valid JSON.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update project.' },
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
