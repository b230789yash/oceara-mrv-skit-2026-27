// Configuration file for API keys and environment variables

// Google Maps API Key - Used for maps, satellite imagery, and location services
// Get your key from: https://console.cloud.google.com/google/maps-apis
// IMPORTANT: Restrict this key in Google Cloud Console to your domain only
export const GOOGLE_MAPS_API_KEY = 
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
  ''

// Google Earth Engine API Key - For real-time satellite imagery and vegetation analysis
// Get your key from: https://earthengine.google.com/
export const EARTH_ENGINE_API_KEY =
  process.env.NEXT_PUBLIC_EARTH_ENGINE_API_KEY || ''

// Sentinel Hub API Key - For Sentinel-2 satellite imagery
// Get your key from: https://www.sentinel-hub.com/
// IMPORTANT: Keep this server-side only when possible
export const SENTINEL_HUB_INSTANCE_ID =
  process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID || 
  process.env.SENTINEL_HUB_INSTANCE_ID || ''

// Mapbox Token - Fallback for satellite imagery if Google Maps quota exceeded
// IMPORTANT: Restrict this token in Mapbox dashboard to your domain only
export const MAPBOX_TOKEN = 
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 
  ''

// Supabase Configuration (Optional)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Firebase Configuration (Optional)
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

// Helper function to generate Google Maps Static API URL
// SECURITY: Use API route proxy instead for production (keeps keys server-side)
export function getGoogleMapsStaticUrl(
  lat: number,
  lng: number,
  zoom: number = 16,
  size: string = '800x600',
  maptype: 'satellite' | 'roadmap' | 'hybrid' | 'terrain' = 'satellite',
  markers?: boolean
): string {
  // Use secure API route instead of exposing API key
  const markerParam = markers !== false ? 'true' : 'false'
  return `/api/maps/static?lat=${lat}&lng=${lng}&zoom=${zoom}&size=${size}&maptype=${maptype}&markers=${markerParam}`
}

// Helper function to load Google Maps JavaScript API
// SECURITY: API key is exposed here - ensure it's restricted in Google Console
export function loadGoogleMapsScript(libraries: string[] = ['places', 'drawing', 'geometry']): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', reject)
      return
    }

    // Only load if API key is configured
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key not configured'))
      return
    }

    // Create and load script
    // SECURITY NOTE: This exposes the key to client - restrict in Google Console!
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraries.join(',')}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Check if Google Maps API key is configured
export function isGoogleMapsConfigured(): boolean {
  return GOOGLE_MAPS_API_KEY !== '' && GOOGLE_MAPS_API_KEY !== 'your_api_key_here'
}

