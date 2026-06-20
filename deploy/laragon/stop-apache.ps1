# Arrête Apache Laragon (Laragon2 en priorité).
# Usage : powershell -ExecutionPolicy Bypass -File stop-apache.ps1

function Resolve-LaragonApacheHttpd {
    foreach ($root in @('C:\laragon2', 'C:\laragon')) {
        $httpd = Get-ChildItem (Join-Path $root 'bin\apache') -Recurse -Filter 'httpd.exe' -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($httpd) { return $httpd }
    }
    return $null
}

$httpd = Resolve-LaragonApacheHttpd
if ($httpd) {
    & $httpd.FullName -k stop 2>$null
}

Get-Process -Name 'httpd' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Apache arrêté." -ForegroundColor Green
