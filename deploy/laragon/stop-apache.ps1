# Arrête Apache Laragon (sans Laragon Pro).
# Usage : powershell -ExecutionPolicy Bypass -File stop-apache.ps1

$httpd = Get-ChildItem 'C:\laragon\bin\apache' -Recurse -Filter 'httpd.exe' -ErrorAction SilentlyContinue |
  Select-Object -First 1

if ($httpd) {
    & $httpd.FullName -k stop 2>$null
}

Get-Process -Name 'httpd' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Apache arrêté." -ForegroundColor Green
