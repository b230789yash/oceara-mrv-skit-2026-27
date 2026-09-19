import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const state = requestUrl.searchParams.get('state')
  const origin = requestUrl.origin

  console.log('🔗 Google OAuth Callback Debug Info:')
  console.log('  - URL:', request.url)
  console.log('  - Origin:', origin)
  console.log('  - Code present:', !!code)
  console.log('  - Error:', error)
  console.log('  - State:', state)
  console.log('  - All params:', Object.fromEntries(requestUrl.searchParams))

  // Check environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.error('❌ Missing OAuth credentials in environment variables')
    return NextResponse.redirect(`${origin}/auth/login?error=missing_credentials&message=OAuth credentials not configured`)
  }
  
  console.log('🔧 Environment Variables:')
  console.log('  - Client ID from env:', !!process.env.GOOGLE_CLIENT_ID)
  console.log('  - Client Secret from env:', !!process.env.GOOGLE_CLIENT_SECRET)

  if (error) {
    console.error('❌ Google OAuth error received:', error)
    const errorDescription = requestUrl.searchParams.get('error_description') || error
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription)}`)
  }

  if (!code) {
    console.error('❌ No authorization code received')
    return NextResponse.redirect(`${origin}/auth/login?error=no_code&message=No authorization code received from Google`)
  }

  try {
    console.log('✅ Processing OAuth code:', code.substring(0, 20) + '...')

    // Same canonical redirect URI as the client (NEXT_PUBLIC_APP_URL) so only one URI is registered in Google Console
    const canonicalOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || origin
    const redirectUri = `${canonicalOrigin}/auth/callback`

    console.log('🔧 Token Exchange Configuration:')
    console.log('  - Redirect URI:', redirectUri)
    console.log('  - Client ID:', clientId.substring(0, 20) + '...')
    console.log('  - Client Secret:', clientSecret.substring(0, 10) + '...')

    // Exchange code for access token
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

    console.log('🔧 Token Exchange Response:')
    console.log('  - Status:', tokenResponse.status)
    console.log('  - Status Text:', tokenResponse.statusText)
    console.log('  - OK:', tokenResponse.ok)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      return NextResponse.redirect(`${origin}/auth/login?error=token_exchange_failed&details=${encodeURIComponent(errorText)}`)
    }

    const tokens = await tokenResponse.json()
    console.log('✅ Tokens received successfully:')
    console.log('  - Access token present:', !!tokens.access_token)
    console.log('  - Refresh token present:', !!tokens.refresh_token)
    console.log('  - Token type:', tokens.token_type)
    console.log('  - Expires in:', tokens.expires_in)

    if (!tokens.access_token) {
      console.error('❌ No access token in response')
      return NextResponse.redirect(`${origin}/auth/login?error=no_access_token`)
    }

    // Get user info
    console.log('🔧 Fetching user info...')
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    console.log('🔧 User Info Response:')
    console.log('  - Status:', userResponse.status)
    console.log('  - OK:', userResponse.ok)

    if (!userResponse.ok) {
      const userErrorText = await userResponse.text()
      console.error('❌ User info fetch failed:', userErrorText)
      return NextResponse.redirect(`${origin}/auth/login?error=user_info_failed&details=${encodeURIComponent(userErrorText)}`)
    }

    const userInfo = await userResponse.json()
    console.log('✅ User info received successfully:')
    console.log('  - ID:', userInfo.id)
    console.log('  - Email:', userInfo.email)
    console.log('  - Name:', userInfo.name)
    console.log('  - Verified email:', userInfo.verified_email)

    // Redirect back to the origin and the dashboard for the role they chose (from state)
    let returnOrigin = origin
    let role: string = 'admin'
    try {
      if (state) {
        const decoded = JSON.parse(decodeURIComponent(state))
        if (decoded.r && typeof decoded.r === 'string') returnOrigin = decoded.r
        if (decoded.role === 'landowner' || decoded.role === 'buyer' || decoded.role === 'admin') role = decoded.role
      }
    } catch {
      // ignore invalid state
    }

    const path = role === 'landowner' ? '/landowner' : role === 'buyer' ? '/buyer' : '/admin'
    const redirectUrl = new URL(`${returnOrigin}${path}`)
    redirectUrl.searchParams.set('google_auth', 'success')
    redirectUrl.searchParams.set('user_email', userInfo.email)
    redirectUrl.searchParams.set('user_name', userInfo.name || '')
    redirectUrl.searchParams.set('user_id', userInfo.id)
    redirectUrl.searchParams.set('user_picture', userInfo.picture || '')

    console.log('✅ Redirecting to admin with success:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('❌ OAuth processing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(`${origin}/auth/login?error=processing_error&details=${encodeURIComponent(errorMessage)}`)
  }
}