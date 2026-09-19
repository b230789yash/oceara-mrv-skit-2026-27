import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Rate limiting storage (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userRequests = requestCounts.get(ip)
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (userRequests.count >= 30) { // 30 requests per minute
    return false
  }
  
  userRequests.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Get parameters
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const zoom = searchParams.get('zoom') || '15'
    const size = searchParams.get('size') || '800x600'
    const maptype = searchParams.get('maptype') || 'satellite'
    
    // Input validation
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }
    
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of range' },
        { status: 400 }
      )
    }
    
    // Get API key from server-side environment variable (not exposed to client)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Maps API not configured' },
        { status: 500 }
      )
    }
    
    // Construct Google Maps Static API URL
    const markers = searchParams.get('markers') !== 'false'
    const markerParam = markers ? `&markers=color:red%7Csize:small%7C${lat},${lng}` : ''
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&scale=2&maptype=${maptype}${markerParam}&key=${apiKey}`
    
    // Fetch image from Google Maps
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch map image' },
        { status: response.status }
      )
    }
    
    const imageBuffer = await response.arrayBuffer()
    
    // Return image with security headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error fetching map:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
