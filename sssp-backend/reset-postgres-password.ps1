# Self-elevate to Administrator if not already elevated
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

$pgHba = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
$serviceName = "postgresql-x64-18"
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $pgHba)) {
    Write-Error "Could not find pg_hba.conf at $pgHba"
    pause
    exit 1
}

Write-Host "1. Backing up and configuring pg_hba.conf to trust mode..." -ForegroundColor Cyan
Copy-Item $pgHba "$pgHba.bak" -Force
$content = Get-Content $pgHba
$content = $content -replace '127\.0\.0\.1/32\s+scram-sha-256', '127.0.0.1/32            trust' `
                    -replace '::1/128\s+scram-sha-256', '::1/128                 trust'
Set-Content $pgHba $content

Write-Host "2. Restarting PostgreSQL service..." -ForegroundColor Cyan
Restart-Service $serviceName

Write-Host "3. Resetting 'postgres' user password to 'postgres'..." -ForegroundColor Cyan
& $psqlPath -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

Write-Host "4. Ensuring database 'sssp_db' exists..." -ForegroundColor Cyan
& $psqlPath -U postgres -d postgres -c "CREATE DATABASE sssp_db;"

Write-Host "5. Restoring pg_hba.conf back to scram-sha-256..." -ForegroundColor Cyan
$content = Get-Content $pgHba
$content = $content -replace '127\.0\.0\.1/32\s+trust', '127.0.0.1/32            scram-sha-256' `
                    -replace '::1/128\s+trust', '::1/128                 scram-sha-256'
Set-Content $pgHba $content

Write-Host "6. Restarting PostgreSQL service again..." -ForegroundColor Cyan
Restart-Service $serviceName

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Password for 'postgres' has been reset to: postgres" -ForegroundColor Green
Write-Host " Database 'sssp_db' is ready!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
pause
