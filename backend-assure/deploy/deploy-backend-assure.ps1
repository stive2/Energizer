# Copie backend-assure vers Laragon2 (serveur 172.17.15.121)
# Usage sur le serveur :
#   powershell -ExecutionPolicy Bypass -File deploy-backend-assure.ps1

$ErrorActionPreference = 'Stop'

$src = $PSScriptRoot
if (-not (Test-Path (Join-Path $src 'bootstrap.php'))) {
    $src = Resolve-Path (Join-Path $PSScriptRoot '..\..\backend-assure')
}

$dst = 'C:\laragon2\www\api-assure'

Write-Host "Source : $src" -ForegroundColor Cyan
Write-Host "Cible  : $dst" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $dst | Out-Null

$exclude = @('config\config.php')
Get-ChildItem $src -Force | ForEach-Object {
    if ($_.Name -eq 'config') {
        New-Item -ItemType Directory -Force -Path (Join-Path $dst 'config') | Out-Null
        Get-ChildItem (Join-Path $src 'config') | ForEach-Object {
            if ($_.Name -ne 'config.php') {
                Copy-Item $_.FullName (Join-Path $dst 'config' $_.Name) -Force
            }
        }
        if (-not (Test-Path (Join-Path $dst 'config\config.php'))) {
            Copy-Item (Join-Path $src 'config\config.example.php') (Join-Path $dst 'config\config.php')
            Write-Host "config.php créé depuis l'exemple — éditez les accès Oracle." -ForegroundColor Yellow
        }
    } else {
        Copy-Item $_.FullName (Join-Path $dst $_.Name) -Recurse -Force
    }
}

Write-Host ""
Write-Host "Backend déployé dans $dst" -ForegroundColor Green
Write-Host "Test : http://127.0.0.1:83/health" -ForegroundColor Green
Write-Host "Voir deploy\laragon\GUIDE-BACKEND-ASSURE.md" -ForegroundColor DarkGray
