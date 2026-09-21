$env:FUNCTIONS_DISCOVERY_TIMEOUT = "120000"
Write-Host "Set FUNCTIONS_DISCOVERY_TIMEOUT to 120000ms" -ForegroundColor Cyan
firebase deploy
