# Auth setup: Google OAuth & Twilio phone

## Google OAuth redirect URL

Use **exactly** these in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your OAuth 2.0 Client → **Authorized redirect URIs**:

- **Local:** `http://localhost:3000/auth/callback`
- **Production:** `https://YOUR_DEPLOYMENT_URL/auth/callback`

Examples:
- Vercel: `https://your-app.vercel.app/auth/callback`
- Custom domain: `https://oceara.example.com/auth/callback`

The app uses the **current origin** for redirect (no hardcoded URL), so add every URL where you run the app.

**Server env (for token exchange in `/auth/callback`):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Client env (for "Sign in with Google" button):**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

---

## Twilio phone OTP (optional)

For **Send OTP via Twilio** on login/signup, set:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID` (Verify Service SID from Twilio Console → Verify)

Create a Verify Service at [Twilio Console → Verify](https://console.twilio.com/us1/develop/verify/services).  
If these are not set, the app falls back to Firebase phone auth (if configured) or shows Firebase component.

---

## Supabase (optional)

For persistent Google session and profiles:

- Use **Supabase Auth** → Providers → Google and set the same redirect URI: `https://YOUR_DEPLOYMENT_URL/auth/callback`
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
