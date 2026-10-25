$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$mvn = "C:\Users\bhara\.gemini\antigravity\scratch\tools\apache-maven-3.9.9\bin\mvn.cmd"

Write-Host "Running JUnit 5 Test Suite (Unit, Concurrency, Shard, Rate Limiter)..." -ForegroundColor Cyan
Set-Location (Join-Path $root "backend")
& $mvn test
Set-Location $root
Write-Host "All tests completed successfully!" -ForegroundColor Green
