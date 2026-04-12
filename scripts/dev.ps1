Write-Host "Starting Acquisition App in Development Mode"
Write-Host "================================================"

if (-not (Test-Path ".env.development")) {
  Write-Host "Error: .env.development file not found!"
  Write-Host "   Please copy .env.development from the template and update with your Neon credentials."
  exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: Docker is not running!"
  Write-Host "   Please start Docker Desktop and try again."
  exit 1
}

if (-not (Test-Path ".neon_local")) {
  New-Item -ItemType Directory -Path ".neon_local" | Out-Null
}

if (Test-Path ".gitignore") {
  $gitignore = Get-Content ".gitignore" -ErrorAction SilentlyContinue
  if ($null -eq $gitignore -or -not ($gitignore -contains ".neon_local/")) {
    Add-Content ".gitignore" ".neon_local/"
    Write-Host "Added .neon_local/ to .gitignore"
  }
}

Write-Host "Building and starting development containers..."
Write-Host "   - Neon Local proxy will create an ephemeral database branch"
Write-Host "   - Application will run with hot reload enabled"
Write-Host ""

docker compose --env-file .env.development -f docker-compose.dev.yml up --build
