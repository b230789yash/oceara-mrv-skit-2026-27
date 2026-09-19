import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'project-uploads'
const MAX_IMAGES = 10
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB per image

function getExtensionFromDataUrl(dataUrl: string): string {
  const m = dataUrl.match(/^data:image\/(\w+);/)
  const type = m?.[1]?.toLowerCase() ?? 'jpeg'
  return type === 'jpeg' ? 'jpg' : type
}

function getContentType(dataUrl: string): string {
  const m = dataUrl.match(/^data:(image\/\w+);/)
  return m?.[1] ?? 'image/jpeg'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const raw = body?.images
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json(
        { error: 'Request body must include an "images" array of base64 data URLs' },
        { status: 400 }
      )
    }
    if (raw.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images per request` },
        { status: 400 }
      )
    }

    const urls: string[] = []
    const prefix = `verification/${Date.now()}`

    for (let i = 0; i < raw.length; i++) {
      const dataUrl = String(raw[i])
      if (!dataUrl.startsWith('data:image/')) {
        return NextResponse.json(
          { error: `Item ${i + 1} is not a valid image data URL` },
          { status: 400 }
        )
      }
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : ''
      if (!base64) {
        return NextResponse.json(
          { error: `Item ${i + 1}: missing base64 data` },
          { status: 400 }
        )
      }
      const buf = Buffer.from(base64, 'base64')
      if (buf.length > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Image ${i + 1} exceeds ${MAX_SIZE_BYTES / 1024 / 1024}MB limit` },
          { status: 400 }
        )
      }
      const ext = getExtensionFromDataUrl(dataUrl)
      const contentType = getContentType(dataUrl)
      const path = `${prefix}-${i}.${ext}`

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType, upsert: true })

      if (error) {
        console.error('Supabase storage upload error:', error)
        return NextResponse.json(
          { error: error.message || 'Upload failed. Ensure the "project-uploads" bucket exists in Supabase Storage and is public.' },
          { status: 502 }
        )
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      urls.push(urlData.publicUrl)
    }

    return NextResponse.json({ urls }, { status: 200 })
  } catch (e: any) {
    console.error('Upload API error:', e)
    return NextResponse.json(
      { error: e?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
