# Diagnostic : d'où Apache sert réellement le port 82 ?
# À lancer SUR LE SERVEUR (172.17.15.121), en PowerShell :
#   powershell -ExecutionPolicy Bypass -File diagnostic-sapelli.ps1

$ErrorActionPreference = 'Continue'

Write-Host ""
Write-Host "=== Diagnostic Sapelli / port 82 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Processus Apache en cours
$httpdProcs = Get-Process -Name 'httpd' -ErrorAction SilentlyContinue
if ($httpdProcs) {
    Write-Host "[Apache] Processus actifs :" -ForegroundColor Green
    $httpdProcs | ForEach-Object {
        try {
            $exe = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").ExecutablePath
            Write-Host "  PID $($_.Id) -> $exe"
        } catch {
            Write-Host "  PID $($_.Id)"
        }
    }
} else {
    Write-Host "[Apache] Aucun processus httpd.exe en cours." -ForegroundColor Yellow
}

Write-Host ""

# 2. Binaires httpd sous laragon / laragon2
foreach ($root in @('C:\laragon', 'C:\laragon2')) {
    if (Test-Path $root) {
        $httpd = Get-ChildItem (Join-Path $root 'bin\apache') -Recurse -Filter 'httpd.exe' -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($httpd) {
            Write-Host "[Laragon] $root -> $($httpd.FullName)" -ForegroundColor DarkGray
        }
    }
}

Write-Host ""

# 3. Dossiers sapelli possibles
$candidates = @(
    'C:\laragon\www\sapelli',
    'C:\laragon2\www\sapelli',
    'C:\laragon\www',
    'C:\laragon2\www'
)

Write-Host "[Dossiers] Contenu sapelli :" -ForegroundColor Cyan
foreach ($path in $candidates) {
    if (Test-Path $path) {
        $index = Join-Path $path 'index.html'
        if (Test-Path $index) {
            $info = Get-Item $index
            Write-Host "  OK  $path\index.html  ($($info.LastWriteTime))" -ForegroundColor Green
        } elseif ((Get-Item $path).PSIsContainer) {
            $count = (Get-ChildItem $path -Force -ErrorAction SilentlyContinue | Measure-Object).Count
            Write-Host "  DIR $path  ($count éléments, pas d'index.html à la racine)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  --- $path  (absent)" -ForegroundColor DarkGray
    }
}

Write-Host ""

# 4. Vhosts Apache (laragon + laragon2)
Write-Host "[Vhost] Fichiers sapelli.conf / port 82 :" -ForegroundColor Cyan
$vhostRoots = @(
    'C:\laragon\etc\apache2\sites-enabled',
    'C:\laragon\etc\apache2\sites-available',
    'C:\laragon2\etc\apache2\sites-enabled',
    'C:\laragon2\etc\apache2\sites-available'
)

foreach ($dir in $vhostRoots) {
    if (-not (Test-Path $dir)) { continue }
    Get-ChildItem $dir -Filter '*.conf' -ErrorAction SilentlyContinue | ForEach-Object {
        $text = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ($text -match '82|sapelli') {
            Write-Host "  Fichier : $($_.FullName)" -ForegroundColor Green
            if ($text -match 'DocumentRoot\s+"([^"]+)"') {
                Write-Host "    DocumentRoot = $($Matches[1])" -ForegroundColor Yellow
            }
            if ($text -match '<VirtualHost\s+\*:82>') {
                Write-Host "    -> VirtualHost *:82 trouvé" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""

# 5. Test HTTP local
Write-Host "[HTTP] Test http://127.0.0.1:82/ :" -ForegroundColor Cyan
try {
    $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:82/' -UseBasicParsing -TimeoutSec 5
    Write-Host "  Status : $($resp.StatusCode)" -ForegroundColor Green
    if ($resp.Content -match '<script[^>]+src="([^"]+)"') {
        Write-Host "  Premier script : $($Matches[1])" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "  Erreur : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Fin diagnostic ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copiez dist\spa vers le DocumentRoot affiché ci-dessus (cible : C:\laragon2\www\sapelli)." -ForegroundColor Yellow
Write-Host ""
