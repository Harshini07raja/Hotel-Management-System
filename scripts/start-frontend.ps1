$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Host "Starting Vite React TypeScript Frontend on port 3000..." -ForegroundColor Cyan
Set-Location (Join-Path $root "frontend")
npm run dev
