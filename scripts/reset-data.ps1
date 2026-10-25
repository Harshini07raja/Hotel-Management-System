$ErrorActionPreference = "Stop"
Write-Host "Resetting all shard collections and re-seeding..." -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8088/api/v1/admin/reset-data" -Method Post
    Write-Host "Success: $($resp.message)" -ForegroundColor Green
} catch {
    Write-Host "Failed to reset data. Make sure backend is running at http://localhost:8088" -ForegroundColor Red
}
