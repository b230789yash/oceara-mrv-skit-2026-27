# Deploy to Oceara/oceara-web-platform

**Target repo:** https://github.com/Oceara/oceara-web-platform.git  
**Your project folder:** `oceara-simple-deploy`

---

## Pilot-ready status (completed)

- **AI/ML:** Deterministic blue-carbon estimation; disclaimers and “preliminary estimate” labelling.
- **ML-ready pipeline:** Estimation inputs/outputs stored in Supabase (`estimation_runs`); versioning field for future training.
- **Satellite/AI:** Static/cached imagery; “Illustrative satellite snapshot” labelling; failures do not break pages.
- **Mobile:** Responsive layout; touch-friendly controls; no horizontal scroll.
- **Hardening:** Loading states on admin, buyer, landowner; fallback UI for empty data; null-safe stats and coordinates; SSR-safe `localStorage` in auth/wallet.
- **Terminology:** Government/CSR-friendly language; transparency, verification, auditability.

**You deploy:** run `npm run build`, then commit and push to `main` (see below). Vercel will build and deploy.

---

## Production fixes (latest)

- **Database & API:** Projects API supports `area`, `latitude`, `longitude`, `status`; null-safe reads; POST normalizes body and returns clear errors. Project creation shows loading state and success/error toasts; new project appears in My Projects immediately.
- **Visibility:** Admin sees all projects; marketplace shows verified projects; My Projects shows user-owned; demo/sample projects always visible and labeled “Demo / Sample”; empty states show explanations.
- **Phone:** Phone saved to `profiles.phone` via PATCH `/api/profiles/me`; international format validated (+countrycode); save only when auth user exists; errors shown on fail. Schema: `profiles.phone` added in `schema-extensions.sql`.
- **Welcome:** Welcome messages are toasts; auto-dismiss 3.5s; non-blocking.
- **Scroll:** No permanent `overflow:hidden` on body; `body.modal-open` locks scroll only when modals are open; restored on close; full mobile scroll.
- **CSP & maps:** CSP allows `nominatim.openstreetmap.org`, `openstreetmap.org`, `tile.openstreetmap.org` (connect-src and img-src). Maps API route is `force-dynamic`. Map/nominatim failures do not crash pages.
- **AI/ML:** No random AI; Earth Engine fallbacks deterministic (seed from coords/area); carbon estimation remains area × coefficients; labels and disclaimer in place; I/O stored for future ML.

---

## Deployment — do this every time (you deploy)

**You handle the actual deploy; use these steps every time.**

1. **Build** (fix any errors first):
   ```powershell
   cd c:\Users\Yash\OneDrive\Desktop\WORK\SIH\oceara-simple-deploy
   npm run build
   ```

2. **Commit** (if you have changes):
   ```powershell
   git add .
   git commit -m "Your short message"
   ```

3. **Push** (triggers Vercel if connected to GitHub):
   ```powershell
   git push -u origin main
   ```
   Use GitHub username + **Personal Access Token** (not password) if prompted.

4. **Vercel** deploys automatically from `main`. Check the project dashboard for build status and the live URL.

5. **Env vars on Vercel:** In Vercel → Project → Settings → Environment Variables, ensure you have at least:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Google OAuth:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and **`NEXT_PUBLIC_APP_URL`** = your main app URL (e.g. `https://your-project.vercel.app`). In Google Cloud Console → APIs & Services → Credentials → your OAuth client → **Authorized redirect URIs** add **exactly**: `https://your-project.vercel.app/auth/callback` (same as `NEXT_PUBLIC_APP_URL` + `/auth/callback`). One URI is enough for all deployments.
   - **Twilio OTP:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and **either** `TWILIO_VERIFY_SERVICE_SID` **or** `TWILIO_VERIFY_SID` (Verify Service SID from Twilio Console → Verify).
   - Optional: `NEXT_PUBLIC_FULL_ACCESS_EMAILS` (comma-separated) for marketplace/wallet visibility.

6. **Supabase – fix project creation 500 (“Could not find the 'location' or other column”):**  
   In **Supabase → SQL Editor**, run **one** of these (run the full migration once; safe to re-run):
   - **Recommended:** open `lib/database/migrations/002_add_projects_missing_columns.sql`, copy all, paste in SQL Editor → Run.  
   - Or run this inline (adds all columns the app needs):
   ```sql
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS name TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_email TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat":0,"lng":0}'::jsonb;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS area TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS credits_available NUMERIC DEFAULT 0;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS price_per_credit NUMERIC DEFAULT 0;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending Review';
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS image TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS images TEXT[];
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS satellite_images TEXT[];
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS field_data JSONB;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS ml_analysis JSONB;
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS documents TEXT[];
   ```

7. **Supabase Storage – verification photos:**  
   For landowner “Upload Photos” (mobile verification photos) to be stored, create a **Storage** bucket in Supabase:
   - **Supabase → Storage → New bucket**
   - Name: `project-uploads`
   - **Public bucket:** ON (so returned image URLs work in the app)
   - Create. The upload API (`/api/upload`) will store photos under `verification/` and attach their URLs to the project via PATCH. If the bucket is missing, photo upload fails gracefully and the project is still created without images.

---

## One-command deploy (recommended)

From **PowerShell**, in the `oceara-simple-deploy` folder, run:

```powershell
cd "c:\Users\Yash\OneDrive\Desktop\WORK\SIH\oceara-simple-deploy"
.\deploy.ps1
```

This will: (1) build the project, (2) commit any changes, (3) push to `origin main`.  
If push asks for credentials, use your GitHub username and a **Personal Access Token** (not password).  
After push succeeds, Vercel will deploy in 1–2 minutes if it’s connected to **Oceara/oceara-web-platform**.

---

## Repositioning (Phase 1: Blue Carbon MRV & Registry)

This codebase is repositioned as a **Blue Carbon MRV & Registry Platform** (government/NGO-friendly).  
- **Roles (UI):** Project Owner, Institution / Program, MRV Administrator  
- **Terminology:** Estimated Carbon Potential (Pre-Certification), Request MRV / Fund Project, Project Registry  
- **Feature flags:** Wallet, marketplace, buy/sell, token prices are **hidden by default**. Visible only for Super Admin role or allowlisted emails (`NEXT_PUBLIC_FULL_ACCESS_EMAILS`).  
- **Carbon disclaimer** shown wherever carbon numbers appear.

---

## Step 1: Fix the build (do this first)

Before pushing, the project must build successfully. Run:

```powershell
cd c:\Users\Yash\OneDrive\Desktop\WORK\SIH\oceara-simple-deploy
npm run build
```

- **If it fails:** Fix the error shown (e.g. type errors, missing deps). The `Project[]` type fix is already in your code (DataContext export + EarthWithProjects import).
- **If it succeeds:** Continue to Step 2.

---

## Step 2: Commit your changes

You have uncommitted changes (the type fix). Commit them:

```powershell
cd c:\Users\Yash\OneDrive\Desktop\WORK\SIH\oceara-simple-deploy
git add .
git status
git commit -m "Blue Carbon MRV & Registry: reposition UI, feature flags, terminology, deploy"
```

- **If you get "nothing to commit":** Either everything is already committed, or `git status` will show what’s left. Add and commit those files.
- **If you get "Please tell me who you are":** Set your Git identity:
  ```powershell
  git config user.email "your-email@example.com"
  git config user.name "Your Name"
  ```
  Then run the `git add` and `git commit` again.

---

## Step 3: Point remote at Oceara (if needed)

Check your remote:

```powershell
git remote -v
```

You want one remote (usually `origin`) to be:

- **URL:** `https://github.com/Oceara/oceara-web-platform.git`

**If `origin` is already that URL:** Skip to Step 4.

**If not, set it:**

```powershell
git remote remove origin
git remote add origin https://github.com/Oceara/oceara-web-platform.git
```

**If you don’t have push access to Oceara:** You need to be added as a collaborator on the repo, or use a fork + pull request (see “Problems” below).

---

## Step 4: Push to Oceara

```powershell
cd c:\Users\Yash\OneDrive\Desktop\WORK\SIH\oceara-simple-deploy
git push -u origin main
```

- **If it asks for username/password:** Use your GitHub username and a **Personal Access Token** (not your GitHub password). Create one at: GitHub → Settings → Developer settings → Personal access tokens.
- **If it says "branch 'main' doesn't exist" on remote:** Try `git push -u origin main:main` or create `main` on the remote (e.g. first push from GitHub UI or another clone).
- **If it says "failed to push" / "permission denied" / "403":** Your account doesn’t have write access to Oceara/oceara-web-platform. Get collaborator access or use a fork (see below).

---

## Step 5: Deploy on Vercel (optional)

After the code is on GitHub:

1. Go to https://vercel.com and sign in (with GitHub).
2. **New Project** → Import **Oceara/oceara-web-platform**.
3. Root Directory: leave default (or set to repo root).
4. **Deploy.**  
   Later: in Project → Settings → Environment Variables, add `NEXT_PUBLIC_FULL_ACCESS_EMAILS` if you want full-access features.

---

## Problems and fixes

| Problem | What to do |
|--------|------------|
| **Build fails (e.g. type error)** | Run `npm run build` and fix the reported error. The Project type fix (export from DataContext, import in EarthWithProjects) should resolve the "two different types with this name" error. |
| **"Please tell me who you are"** | Run `git config user.email "..."` and `git config user.name "..."` then commit again. |
| **"Permission denied" / "403" / "failed to push"** | Your GitHub user doesn’t have write access to Oceara/oceara-web-platform. **Option A:** Ask an owner to add you as a collaborator. **Option B:** Fork the repo (e.g. Yash5274/oceara-web-platform), push to your fork, then open a Pull Request to Oceara/oceara-web-platform. |
| **"Updates were rejected" / "non-fast-forward"** | Someone else pushed to `main`. Run `git pull origin main --rebase`, fix conflicts if any, then `git push origin main`. |
| **Wrong remote URL** | `git remote -v` to check; `git remote set-url origin https://github.com/Oceara/oceara-web-platform.git` to fix. |
| **Vercel build fails** | Check Vercel build logs. Often: missing env vars, Node version, or the same type/build errors you fix locally with `npm run build`. |

---

## Summary (no confusion)

1. **Build:** `npm run build` in `oceara-simple-deploy` — fix any errors.
2. **Commit:** `git add .` → `git commit -m "Your message"` (and set `user.name`/`user.email` if needed).
3. **Remote:** `origin` = `https://github.com/Oceara/oceara-web-platform.git`.
4. **Push:** `git push -u origin main`.
5. **Deploy:** Vercel auto-deploys from GitHub when you push. You deploy by pushing; no extra step.

**Remember:** You run the deploy (build → commit → push). The app deploys on Vercel when you push to `main`.
