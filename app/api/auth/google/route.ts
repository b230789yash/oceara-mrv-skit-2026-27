import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  console.log('🔗 Google OAuth API Route called:', { action })
  
  if (action === 'initiate') {
    return initiateGoogleAuth(request)
  } else if (action === 'callback') {
    return handleGoogleCallback(request)
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code, state } = body
    
    console.log('🔗 Google OAuth API POST:', { action })
    
    if (action === 'exchange') {
      return exchangeCodeForToken(code, state, request)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Google OAuth API POST error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

async function initiateGoogleAuth(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    if (!clientId) {
      console.error('❌ Google Client ID not found in environment variables')
      return NextResponse.json({ 
        error: 'Google OAuth not configured',
        details: 'GOOGLE_CLIENT_ID not found in environment variables'
      }, { status: 500 })
    }
    
    const origin = request.headers.get('origin') || request.url.split('/').slice(0, 3).join('/')
    const isLocalhost = origin.includes('localhost')
    const redirectUri = isLocalhost 
      ? 'http://localhost:3000/auth/callback'
      : 'https://oceara-web-platform.vercel.app/auth/callback'
    
    const state = Math.random().toString(36).substring(7)
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'select_account')
    authUrl.searchParams.set('state', state)
    
    console.log('✅ Google OAuth URL generated:', authUrl.toString())
    
    return NextResponse.json({
      authUrl: authUrl.toString(),
      state,
      redirectUri
    })
  } catch (error) {
    console.error('❌ Failed to initiate Google auth:', error)
    return NextResponse.json({ 
      error: 'Failed to initiate Google authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handleGoogleCallback(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')
  
  console.log('🔗 Google OAuth callback received:', { 
    code: !!code, 
    error, 
    state 
  })
  
  if (error) {
    return NextResponse.json({ 
      error: 'OAuth error',
      details: error
    }, { status: 400 })
  }
  
  if (!code) {
    return NextResponse.json({ 
      error: 'No authorization code received'
    }, { status: 400 })
  }
  
  try {
    const result = await exchangeCodeForToken(code, state, request)
    return result
  } catch (error) {
    console.error('❌ Callback handling error:', error)
    return NextResponse.json({ 
      error: 'Callback handling failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function exchangeCodeForToken(code: string, state: string | null, request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing OAuth credentials')
      return NextResponse.json({ 
        error: 'OAuth credentials not configured',
        details: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found'
      }, { status: 500 })
    }
    
    const origin = request.headers.get('origin') || request.url.split('/').slice(0, 3).join('/')
    const isLocalhost = origin.includes('localhost')
    const redirectUri = isLocalhost 
      ? 'http://localhost:3000/auth/callback'
      : 'https://oceara-web-platform.vercel.app/auth/callback'
    
    console.log('🔧 Token exchange configuration:')
    console.log('  - Client ID:', clientId.substring(0, 20) + '...')
    console.log('  - Client Secret:', clientSecret.substring(0, 10) + '...')
    console.log('  - Redirect URI:', redirectUri)
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    })
    
    console.log('🔧 Token exchange response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      return NextResponse.json({ 
        error: 'Token exchange failed',
        details: errorText
      }, { status: 400 })
    }
    
    const tokens = await tokenResponse.json()
    console.log('✅ Tokens received:', {
      access_token: !!tokens.access_token,
      refresh_token: !!tokens.refresh_token,
      expires_in: tokens.expires_in
    })
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })
    
    if (!userResponse.ok) {
      const userErrorText = await userResponse.text()
      console.error('❌ User info fetch failed:', userErrorText)
      return NextResponse.json({ 
        error: 'Failed to fetch user info',
        details: userErrorText
      }, { status: 400 })
    }
    
    const userInfo = await userResponse.json()
    console.log('✅ User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        verified_email: userInfo.verified_email
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in
      }
    })
    
  } catch (error) {
    console.error('❌ Token exchange error:', error)
    return NextResponse.json({ 
      error: 'Token exchange failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

