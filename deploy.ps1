# Deploy Oceara to GitHub (Oceara/oceara-web-platform) - run this in PowerShell from oceara-simple-deploy folder
# Your site updates when: 1) push succeeds  2) Vercel is connected to this repo (auto-deploys)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== 1. Building ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed. Fix errors above." -ForegroundColor Red; exit 1 }

Write-Host "`n=== 2. Staging all changes ===" -ForegroundColor Cyan
git add .
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
} else {
  Write-Host "=== 3. Committing ===" -ForegroundColor Cyan
  git commit -m "Deploy: build and latest changes"
}

Write-Host "`n=== 4. Pushing to origin main ===" -ForegroundColor Cyan
git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nPush failed. Run these in your terminal (you must enter GitHub credentials):" -ForegroundColor Red
  Write-Host "  cd `"$PWD`"" -ForegroundColor White
  Write-Host "  git push -u origin main" -ForegroundColor White
  Write-Host "`nIf token expired: GitHub -> Settings -> Developer settings -> Personal access tokens" -ForegroundColor Yellow
  exit 1
}

Write-Host "`nDone. If Vercel is connected to Oceara/oceara-web-platform, the site will update in 1-2 min." -ForegroundColor Green
