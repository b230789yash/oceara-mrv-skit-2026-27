import { createClient } from '@/lib/supabase/client'
import { formatAreaForDisplay, toNumericArea } from '@/lib/area'

export interface Project {
  id: string
  name: string
  owner: string
  owner_email?: string
  location: string
  coordinates: { lat: number; lng: number }
  area: string
  credits_available: number
  price_per_credit: number
  verified: boolean
  status: 'Pending Review' | 'Under Verification' | 'Verified' | 'Active' | 'Rejected'
  impact?: string
  image?: string
  description?: string
  submitted_date: string
  images?: string[]
  satellite_images?: string[]
  field_data?: {
    trees: number
    species: string
    soilType: string
    waterSalinity: string
  }
  ml_analysis?: {
    treeCount: number
    mangroveArea: number
    healthScore: number
    speciesDetected: string[]
    carbonCredits: number
    confidence: number
  }
  documents?: string[]
  created_at?: string
  updated_at?: string
}

// Normalize coordinates from DB row (supports coordinates JSONB or latitude/longitude columns)
function normalizeCoordinates(project: any): { lat: number; lng: number } {
  if (project.coordinates && typeof project.coordinates.lat === 'number' && typeof project.coordinates.lng === 'number') {
    return { lat: project.coordinates.lat, lng: project.coordinates.lng }
  }
  const lat = project.latitude != null ? Number(project.latitude) : NaN
  const lng = project.longitude != null ? Number(project.longitude) : NaN
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng }
  return { lat: 0, lng: 0 }
}

// Convert database format to app format; handle null/missing area, status, coordinates for older rows. Area stored as number in DB, displayed as "X hectares".
function dbToApp(project: any): Project {
  return {
    id: project.id,
    name: project.name ?? '',
    owner: project.owner ?? '',
    owner_email: project.owner_email,
    location: project.location ?? '',
    coordinates: normalizeCoordinates(project),
    area: formatAreaForDisplay(project.area),
    credits_available: project.credits_available ?? 0,
    price_per_credit: parseFloat(project.price_per_credit) || 0,
    verified: Boolean(project.verified),
    status: project.status ?? 'Pending Review',
    impact: project.impact ?? '',
    image: project.image ?? '🌴',
    description: project.description ?? '',
    submitted_date: project.submitted_date || project.created_at || new Date().toISOString(),
    images: project.images || [],
    satellite_images: project.satellite_images || [],
    field_data: project.field_data,
    ml_analysis: project.ml_analysis,
    documents: project.documents || [],
    created_at: project.created_at,
    updated_at: project.updated_at,
  }
}

// Convert app format to database format (full row for updates/selects).
function appToDb(project: Partial<Project>): any {
  const coords = project.coordinates ?? { lat: 0, lng: 0 }
  const lat = typeof coords.lat === 'number' ? coords.lat : 0
  const lng = typeof coords.lng === 'number' ? coords.lng : 0
  const row: any = {
    name: project.name ?? '',
    owner: project.owner ?? '',
    owner_email: project.owner_email,
    location: project.location ?? '',
    coordinates: { lat, lng },
    area: project.area != null ? String(project.area) : '',
    credits_available: project.credits_available ?? 0,
    price_per_credit: project.price_per_credit ?? 0,
    verified: Boolean(project.verified),
    status: project.status ?? 'Pending Review',
    impact: project.impact ?? '',
    image: project.image ?? '🌴',
    description: project.description ?? '',
    images: project.images ?? [],
    satellite_images: project.satellite_images,
    field_data: project.field_data,
    ml_analysis: project.ml_analysis,
    documents: project.documents ?? [],
  }
  return row
}

/** Minimal insert row: only columns that commonly exist. Area must be numeric for DB. */
function buildMinimalInsertRow(project: Partial<Project>): Record<string, unknown> {
  const coords = project.coordinates ?? { lat: 0, lng: 0 }
  const lat = typeof coords.lat === 'number' ? coords.lat : 0
  const lng = typeof coords.lng === 'number' ? coords.lng : 0
  const areaNum = typeof project.area === 'number' ? project.area : toNumericArea(project.area)
  return {
    name: project.name ?? '',
    owner: project.owner ?? '',
    owner_email: project.owner_email ?? null,
    location: project.location ?? '',
    coordinates: { lat, lng },
    area: areaNum,
    credits_available: project.credits_available ?? 0,
    price_per_credit: project.price_per_credit ?? 0,
    verified: Boolean(project.verified),
    status: project.status ?? 'Pending Review',
  }
}

export class ProjectsDatabase {
  private supabase: any

  /** Pass a Supabase client (e.g. from server) or leave empty to use browser client */
  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient ?? createClient()
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching project:', error)
      throw error
    }

    return data ? dbToApp(data) : null
  }

  async getProjectsByOwner(owner: string): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner', owner)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects by owner:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getProjectsByOwnerEmail(email: string): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner_email', email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects by owner email:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getPendingProjects(): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .in('status', ['Pending Review', 'Under Verification'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending projects:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getVerifiedProjects(): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('verified', true)
      .in('status', ['Verified', 'Active'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching verified projects:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async createProject(project: Omit<Project, 'id' | 'submitted_date' | 'created_at' | 'updated_at'>): Promise<Project> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    // Use minimal insert so it works even when optional columns (documents, images, etc.) don't exist yet
    const insertRow = buildMinimalInsertRow(project)

    const { data, error } = await this.supabase
      .from('projects')
      .insert(insertRow)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw error
    }

    return dbToApp(data)
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    // Only update columns that are present in updates (partial update)
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.owner !== undefined) updateData.owner = updates.owner
    if (updates.owner_email !== undefined) updateData.owner_email = updates.owner_email
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.coordinates !== undefined) updateData.coordinates = updates.coordinates
    if (updates.area !== undefined) updateData.area = typeof updates.area === 'number' ? updates.area : toNumericArea(updates.area)
    if (updates.credits_available !== undefined) updateData.credits_available = updates.credits_available
    if (updates.price_per_credit !== undefined) updateData.price_per_credit = updates.price_per_credit
    if (updates.verified !== undefined) updateData.verified = updates.verified
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.impact !== undefined) updateData.impact = updates.impact
    if (updates.image !== undefined) updateData.image = updates.image
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.images !== undefined) updateData.images = updates.images
    if (updates.satellite_images !== undefined) updateData.satellite_images = updates.satellite_images
    if (updates.field_data !== undefined) updateData.field_data = updates.field_data
    if (updates.ml_analysis !== undefined) updateData.ml_analysis = updates.ml_analysis
    if (updates.documents !== undefined) updateData.documents = updates.documents
    if (Object.keys(updateData).length === 0) {
      return (await this.getProjectById(id))!
    }

    const { data, error } = await this.supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw error
    }

    return dbToApp(data)
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  async isConfigured(): Promise<boolean> {
    return this.supabase !== null && 
           !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
           !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}
