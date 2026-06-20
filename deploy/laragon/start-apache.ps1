# Démarre Apache Laragon2 (port 82) SANS passer par "laragon.exe start all".
# Usage : powershell -ExecutionPolicy Bypass -File start-apache.ps1

$ErrorActionPreference = 'Stop'

function Resolve-LaragonApacheHttpd {
    foreach ($root in @('C:\laragon2', 'C:\laragon')) {
        $httpd = Get-ChildItem (Join-Path $root 'bin\apache') -Recurse -Filter 'httpd.exe' -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($httpd) { return $httpd }
    }
    return $null
}

$httpd = Resolve-LaragonApacheHttpd
if (-not $httpd) {
    Write-Error "httpd.exe introuvable sous C:\laragon2\bin\apache ou C:\laragon\bin\apache"
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
    Write-Host "DocumentRoot attendu : C:\laragon2\www\sapelli" -ForegroundColor DarkGray
    Write-Host "Test : http://127.0.0.1:82/" -ForegroundColor DarkGray
} else {
    Write-Error "Apache ne semble pas démarré. Vérifiez C:\laragon2\logs\ ou lancez httpd.exe en console."
}
