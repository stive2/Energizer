# Copier vers deploy-config.ps1 sur le serveur (optionnel si déploiement manuel).
# Serveur CNPS : Apache actif = Laragon2 (C:\laragon2).

@{
    # URL : http://172.17.15.121:82/#/energizer-login

    LaragonRoot      = 'C:\laragon2'
    LaragonWwwPath   = 'C:\laragon2\www\sapelli'

    InstallApacheVhost = $true
    ApacheVhostSource  = "$PSScriptRoot\apache-energizer.conf"
    ApacheVhostTarget  = 'C:\laragon2\etc\apache2\sites-enabled\sapelli.conf'

    BackupPrevious = $true
    BackupRoot     = 'C:\laragon2\www\_backups\sapelli'
}
