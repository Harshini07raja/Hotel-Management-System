$ErrorActionPreference = "Stop"
Write-Host "Seeding demonstration dataset across MongoDB shards..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8088/api/v1/admin/seed-data" -Method Post
    Write-Host "Success: $($resp.message)" -ForegroundColor Green
} catch {
    Write-Host "Failed to seed data. Make sure backend is running at http://localhost:8088" -ForegroundColor Red
}
