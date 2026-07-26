# Amdox ERP Enterprise Cloud Suite - Local Orchestration Script
# April 2026

Write-Host "LOG: Launching Amdox Enterprise ERP Suite..."

# 1. Environment Check
if (!(Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Error "npm.cmd is not installed. Please install Node.js 22+."
    exit
}

# 2. Database Sync (requires active Postgres)
Write-Host "LOG: Syncing Database Backbone..."
Set-Location -Path "$PSScriptRoot/backend"
npx.cmd prisma generate
Set-Location -Path "$PSScriptRoot"

# 3. Start Backend
Write-Host "LOG: Starting NestJS Gateway (Port 5000)..."
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot/backend"

# 4. Start Frontend
Write-Host "LOG: Starting Next.js Frontend (Port 3000)..."
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot/frontend"

Write-Host "LOG: Systems are initiating in the background."
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:5000/api/v1"
Write-Host "Press Ctrl+C to stop servers manually."
