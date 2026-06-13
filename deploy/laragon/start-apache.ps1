# Démarre Apache Laragon SANS passer par "laragon.exe start all" (licence Pro).
# Usage (PowerShell admin recommandé) :
#   powershell -ExecutionPolicy Bypass -File start-apache.ps1

$ErrorActionPreference = 'Stop'

$httpd = Get-ChildItem 'C:\laragon\bin\apache' -Recurse -Filter 'httpd.exe' -ErrorAction SilentlyContinue |
  Select-Object -First 1

if (-not $httpd) {
    Write-Error "httpd.exe introuvable sous C:\laragon\bin\apache"
}

$running = Get-Process -Name 'httpd' -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "Apache est déjà démarré ($($running.Count) processus httpd)." -ForegroundColor Yellow
    exit 0
}

Write-Host "Démarrage : $($httpd.FullName)" -ForegroundColor Cyan
Start-Process -FilePath $httpd.FullName -WindowStyle Hidden

Start-Sleep -Seconds 2
$check = Get-Process -Name 'httpd' -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "Apache démarré." -ForegroundColor Green
    Write-Host "Test : http://127.0.0.1:82/" -ForegroundColor DarkGray
} else {
    Write-Error "Apache ne semble pas démarré. Vérifiez C:\laragon\logs\ ou lancez httpd.exe en console pour voir l'erreur."
}
