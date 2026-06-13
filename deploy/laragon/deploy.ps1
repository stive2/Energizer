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

    # Nettoyage complet avant copie — évite index.html / assets obsolètes mélangés
    if (Test-Path $wwwPath) {
        Get-ChildItem -Path $wwwPath -Force | Remove-Item -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $wwwPath | Out-Null
    Write-Host "Déploiement vers $wwwPath …" -ForegroundColor Cyan
    Copy-Item -Path (Join-Path $distSpa '*') -Destination $wwwPath -Recurse -Force

    $indexPath = Join-Path $wwwPath 'index.html'
    if (Test-Path $indexPath) {
        $indexInfo = Get-Item $indexPath
        Write-Host "index.html déployé : $($indexInfo.LastWriteTime)" -ForegroundColor DarkGray
    } else {
        Write-Warning "index.html introuvable dans $wwwPath — vérifiez que vous copiez le contenu de dist\spa\ (pas le dossier spa lui-même)."
    }

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
    Write-Host "Dossier www : $wwwPath" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Si le navigateur affiche encore l'ancienne version :" -ForegroundColor Yellow
    Write-Host "  1. Redémarrez Apache (demarrer-apache.bat ou Laragon Stop/Start)" -ForegroundColor Yellow
    Write-Host "  2. Recharge forcée : Ctrl+Shift+R (ou navigation privée)" -ForegroundColor Yellow
    Write-Host "  3. Vérifiez que dist\spa\index.html est bien copié À LA RACINE de sapelli\" -ForegroundColor Yellow
}
finally {
    Pop-Location
}
