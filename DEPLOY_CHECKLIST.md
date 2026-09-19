# Deploy checklist – Oceara

Use this to deploy and confirm everything works.

---

## 1. Before deploy

- [ ] **Build locally**  
  From project root: `npm run build`  
  Fix any TypeScript or build errors before pushing.

- [ ] **Environment variables (Vercel)**  
  In Vercel → Project → Settings → Environment Variables, set at least:
  - **Google OAuth (for Sign in with Google):**  
    `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - **Optional:** Supabase, Twilio, Firebase, Google Maps (see AUTH_SETUP.md)

- [ ] **Google Console redirect URI**  
  Add your live URL:  
  `https://YOUR_VERCEL_DOMAIN/auth/callback`  
  (e.g. `https://oceara-web-platform-1.vercel.app/auth/callback`)

---

## 2. Deploy

**Option A – Git push (if Vercel is connected to GitHub)**  
From `oceara-simple-deploy`:

```powershell
npm run build
git add .
git commit -m "Deploy: latest changes"
git push origin main
```

Or run:

```powershell
.\deploy.ps1
```

**Option B – Vercel CLI**  
`vercel --prod` (after `vercel link` if needed).

---

## 3. After deploy – check these

- [ ] **Home** (`/`) – Loads, role cards and CTA work.
- [ ] **How It Works** (`/how-it-works`) – Page loads.
- [ ] **Projects** (`/buyer`) – Project Registry loads.
- [ ] **Reports** (`/reports`) – Page loads, links to admin/buyer work.
- [ ] **Contact** (`/contact`) – Form loads, submit shows toast.
- [ ] **Login** (`/auth/login`) – Email, Phone, Social tabs; demo login works.
- [ ] **Sign up** (`/auth/signup`) – Same tabs; signup works.
- [ ] **Sign in with Google** – Redirects to Google, then back to your app (needs redirect URI and env vars).
- [ ] **Phone OTP (Twilio)** – Only if Twilio env is set; Send OTP and Verify work.
- [ ] **Project Owner** (`/landowner`) – After demo login; register project, map, Earth Engine section.
- [ ] **MRV Admin** (`/admin`) – After demo admin login; approve/reject, reports.
- [ ] **Wallet/Registry** (`/wallet`) – Only if feature-flag / full-access is enabled.

---

## 4. Optional: performance

- Build is already set up with: `compress: true`, `productionBrowserSourceMaps: false`, security headers.
- Heavy 3D (RealisticEarth) is dynamic-imported with `ssr: false` to keep initial bundle smaller.
- For faster first load you can add more dynamic imports for admin/buyer dashboards if needed.

---

## 5. If something fails

- **Build fails:** Run `npx tsc --noEmit` and fix reported errors.
- **Google login fails:** Confirm redirect URI in Google Console and env vars in Vercel; see AUTH_SETUP.md.
- **Twilio OTP fails:** Confirm `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` in Vercel.
- **Blank or 404:** Check Vercel build logs; ensure `npm run build` succeeds locally.
