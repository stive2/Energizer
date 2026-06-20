# Energizer IHM (Quasar / Vue 3)

Interface relookée CNPS Energizer — déploiement **Laragon2** dossier **`C:\laragon2\www\sapelli`**.

## Déploiement (votre PC → serveur 172.17.15.121)

### Sur votre PC

```powershell
cd C:\projets\ProjetsCNPS\RelookEnergizerIHM\Energizer
npm install
npm run build
```

### Sur le serveur (copie manuelle)

1. Contenu de `dist\spa\` → **`C:\laragon2\www\sapelli\`**
2. `deploy\laragon\apache-energizer.conf` → **`C:\laragon2\etc\apache2\sites-enabled\sapelli.conf`**
3. Redémarrer Apache Laragon2 (`demarrer-apache.bat` ou Laragon2 Stop/Start)

**URL :** `http://172.17.15.121:82/#/energizer-login`

> Apache actif sur le serveur = **Laragon2**. Ne pas déployer dans `C:\laragon\www\sapelli` (ancien chemin).

**URL :** `http://172.17.15.121:82/#/energizer-login`

> Utilisez **`npm run build`** (pas `build:tomcat`). Le dossier `sapelli` est la racine du site sur le port 82.

Alternative Tomcat : [deploy/tomcat/GUIDE-DEPLOIEMENT-TOMCAT.md](deploy/tomcat/GUIDE-DEPLOIEMENT-TOMCAT.md)

---

## Développement

```bash
npm run dev
```

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run build` | Build Laragon / sapelli |
| `npm run deploy:laragon` | Build + copie (si projet sur le serveur) |
| `npm run build:tomcat` | Build Tomcat (optionnel) |
