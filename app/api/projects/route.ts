import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProjectsDatabase } from '@/lib/database/projects'
import { toNumericArea } from '@/lib/area'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const db = new ProjectsDatabase(supabase)
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const ownerEmail = searchParams.get('owner_email')
    const status = searchParams.get('status')
    const verified = searchParams.get('verified')

    let projects

    if (owner) {
      projects = await db.getProjectsByOwner(owner)
    } else if (ownerEmail) {
      projects = await db.getProjectsByOwnerEmail(ownerEmail)
    } else if (status === 'pending') {
      projects = await db.getPendingProjects()
    } else if (verified === 'true') {
      projects = await db.getVerifiedProjects()
    } else {
      projects = await db.getAllProjects()
    }

    return NextResponse.json({ projects }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const db = new ProjectsDatabase(supabase)
    const body = await request.json()

    // Normalize body: area must be numeric for DB; status and coordinates
    const areaNum = toNumericArea(body.area ?? body.ml_analysis?.mangroveArea ?? 0)
    const status = body.status ?? 'Pending Review'
    let coordinates = body.coordinates
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      const lat = body.latitude != null ? Number(body.latitude) : NaN
      const lng = body.longitude != null ? Number(body.longitude) : NaN
      coordinates = !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : { lat: 0, lng: 0 }
    }
    const payload = {
      ...body,
      area: areaNum,
      status,
      coordinates,
    }

    const project = await db.createProject(payload)
    const areaHa = areaNum
    const co2 = body.credits_available ?? body.ml_analysis?.carbonCredits ?? 0
    const methodology = 'Area-based reference coefficient (mangrove 6–10 tCO₂e/ha/year). Preliminary, subject to verification.'
    await supabase.from('estimation_runs').insert({
      project_id: project.id,
      area_hectares: areaHa,
      ecosystem_type: 'mangrove',
      location: body.location ?? null,
      coordinates: body.coordinates ?? null,
      estimated_co2_tonnes_per_year: co2,
      methodology_used: methodology,
      confidence_level: 'preliminary',
      estimation_model_version: '1.0.0',
      health_score: body.ml_analysis?.healthScore ?? null,
    }).then(({ error }) => { if (error) console.warn('estimation_runs insert skipped:', error.message) })
    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/projects:', error)
    const message = error?.message || 'Failed to create project'
    const status = message.includes('configured') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
