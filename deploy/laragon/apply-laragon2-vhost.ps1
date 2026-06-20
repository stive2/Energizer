# Applique le vhost Laragon2 (port 82 -> C:\laragon2\www\sapelli) sur le serveur.
# Usage SUR LE SERVEUR :
#   powershell -ExecutionPolicy Bypass -File apply-laragon2-vhost.ps1

$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot 'apache-energizer.conf'
$dst = 'C:\laragon2\etc\apache2\sites-enabled\sapelli.conf'
$www = 'C:\laragon2\www\sapelli'
$oldVhost = 'C:\laragon\etc\apache2\sites-enabled\sapelli.conf'

if (-not (Test-Path $src)) {
    Write-Error "Fichier introuvable : $src"
}

New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
New-Item -ItemType Directory -Force -Path $www | Out-Null
New-Item -ItemType Directory -Force -Path 'C:\laragon2\logs' | Out-Null

Copy-Item $src $dst -Force
Write-Host "Vhost copié : $dst" -ForegroundColor Green

if (Test-Path $oldVhost) {
    $bak = "$oldVhost.disabled"
    if (-not (Test-Path $bak)) {
        Rename-Item $oldVhost $bak -Force
        Write-Host "Ancien vhost Laragon désactivé : $bak" -ForegroundColor Yellow
    }
}

$httpd = Get-ChildItem 'C:\laragon2\bin\apache' -Recurse -Filter 'httpd.exe' -ErrorAction SilentlyContinue |
    Select-Object -First 1
if ($httpd) {
    & $httpd.FullName -t
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Configuration Apache invalide — corrigez avant redémarrage."
    }
    Write-Host "Configuration Apache OK." -ForegroundColor Green
    Write-Host "Redémarrez Apache : stop-apache.ps1 puis start-apache.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Déployez ensuite dist\spa\* vers : $www" -ForegroundColor Cyan
Write-Host "URL : http://172.17.15.121:82/#/energizer-login" -ForegroundColor Green
