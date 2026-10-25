$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$script = Join-Path $root "load-tests\scripts\load_test_suite.py"

Write-Host "Executing Automated Load Testing & Benchmark Suite (Low, Medium, High)..." -ForegroundColor Cyan
python $script
Write-Host "Load testing completed. Check experiments/raw-results/ and experiments/processed-results/" -ForegroundColor Green
