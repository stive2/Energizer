# Copier vers deploy-config.ps1 sur le serveur (optionnel si déploiement manuel).

@{
    # URL : http://172.17.15.121:82/#/energizer-login

    LaragonWwwPath = 'C:\laragon\www\sapelli'

    InstallApacheVhost = $true
    ApacheVhostSource  = "$PSScriptRoot\apache-energizer.conf"
    ApacheVhostTarget  = 'C:\laragon\etc\apache2\sites-enabled\sapelli.conf'

    BackupPrevious = $true
    BackupRoot     = 'C:\laragon\www\_backups\sapelli'
}
