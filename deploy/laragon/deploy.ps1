# Build Quasar (mode production) et déploiement vers Laragon.
# Usage : npm run deploy:laragon
#         npm run deploy:laragon -- -SkipBuild   (copie seulement dist/spa)

[CmdletBinding()]
param(
    [switch] $SkipBuild,
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$configPath = Join-Path $PSScriptRoot 'deploy-config.ps1'
$examplePath = Join-Path $PSScriptRoot 'deploy-config.example.ps1'

if (-not (Test-Path $configPath)) {
    Write-Host "Création de deploy-config.ps1 depuis l'exemple…" -ForegroundColor Yellow
    Copy-Item $examplePath $configPath
    Write-Host "Éditez deploy\laragon\deploy-config.ps1 si les chemins Laragon diffèrent." -ForegroundColor Yellow
}

$config = & $configPath
$wwwPath = $config.LaragonWwwPath
$distSpa = Join-Path $repoRoot 'dist\spa'

Push-Location $repoRoot
try {
    if (-not $SkipBuild) {
        Write-Host "Build production ( .env.production )…" -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build a échoué (code $LASTEXITCODE)." }
    }

    if (-not (Test-Path $distSpa)) {
        throw "Dossier introuvable : $distSpa — lancez d'abord npm run build."
    }

    if ($config.BackupPrevious -and (Test-Path $wwwPath)) {
        $backupRoot = $config.BackupRoot
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $backupDir = Join-Path $backupRoot $stamp
        New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
        Write-Host "Sauvegarde : $backupDir" -ForegroundColor DarkGray
        Copy-Item -Path (Join-Path $wwwPath '*') -Destination $backupDir -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path $wwwPath | Out-Null
    Write-Host "Déploiement vers $wwwPath …" -ForegroundColor Cyan
    Copy-Item -Path (Join-Path $distSpa '*') -Destination $wwwPath -Recurse -Force

    if ($config.InstallApacheVhost) {
        $vhostSrc = $config.ApacheVhostSource
        $vhostDst = $config.ApacheVhostTarget
        if ((Test-Path $vhostSrc) -and $vhostDst) {
            $vhostParent = Split-Path $vhostDst -Parent
            if ($vhostParent) {
                New-Item -ItemType Directory -Force -Path $vhostParent | Out-Null
            }
            Copy-Item $vhostSrc $vhostDst -Force
            Write-Host "Vhost Apache copié : $vhostDst" -ForegroundColor Green
            Write-Host "Redémarrez Apache dans Laragon." -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "Déploiement terminé." -ForegroundColor Green
    Write-Host "URL : http://172.17.15.121:82/#/energizer-login" -ForegroundColor Green
    Write-Host "Dossier www : C:\laragon\www\sapelli" -ForegroundColor DarkGray
}
finally {
    Pop-Location
}
