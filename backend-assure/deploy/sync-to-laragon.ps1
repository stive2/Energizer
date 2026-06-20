# Copie backend-assure vers Laragon (port 83)
# Usage : .\deploy\sync-to-laragon.ps1
#         .\deploy\sync-to-laragon.ps1 -Target "C:\laragon2\www\api-assure"

param(
    [string]$Target = "C:\laragon2\www\api-assure"
)

$Source = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path "$Source\public\index.php")) {
    throw "Dossier backend-assure introuvable : $Source"
}

Write-Host "Source : $Source"
Write-Host "Cible  : $Target"

$items = @('bootstrap.php', 'config', 'lib', 'public', 'src', 'deploy')

New-Item -ItemType Directory -Force -Path $Target | Out-Null

foreach ($item in $items) {
    $srcPath = Join-Path $Source $item
    $dstPath = Join-Path $Target $item
    if (-not (Test-Path $srcPath)) { continue }
    if ($item -eq 'config') {
        New-Item -ItemType Directory -Force -Path $dstPath | Out-Null
        Copy-Item -Path "$srcPath\config.example.php" -Destination $dstPath -Force
        if (-not (Test-Path "$dstPath\config.php")) {
            Copy-Item -Path "$srcPath\config.example.php" -Destination "$dstPath\config.php" -Force
            Write-Host 'Cree config.php depuis l exemple - editez le mot de passe Oracle.'
        } else {
            Write-Host 'Conserve config.php existant (non ecrase).'
        }
        continue
    }
    Copy-Item -Path $srcPath -Destination $dstPath -Recurse -Force
}

Write-Host 'Termine. Redemarrez Apache (Laragon Stop All / Start All).'
Write-Host 'Test navigateur : http://127.0.0.1:83/health'
Write-Host 'Test assures    : http://127.0.0.1:83/dev/assures-sample'
