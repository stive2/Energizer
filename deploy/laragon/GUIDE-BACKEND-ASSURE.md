# Déploiement backend-assure (PHP) — Laragon 6 / Laragon2 — serveur 172.17.15.121

Environnement cible : **Laragon 6.0**, **PHP 8.1.10** (compatible avec `backend-assure`).

- **Frontend Quasar** : port **82** (`sapelli.conf`)
- **API backend-assure** : port **83** (`api-assure.conf`)

API JSON pour l’espace assuré (authentification + gestion de compte), inspirée de  
`assureOriginal/.../espaceAssure_new_look/backend/api/` et `CompteAssure/`.

## 1. Copier les fichiers sur le serveur

Depuis votre PC, copiez **tout le dossier** du projet :

```
Energizer\backend-assure\
```

vers le serveur :

```
C:\laragon2\www\api-assure\
```

Structure attendue :

```
C:\laragon2\www\api-assure\
  bootstrap.php
  config\
  lib\
  public\
    index.php
    .htaccess
  src\
```

## 2. Configuration Oracle (obligatoire)

Sur le serveur :

```powershell
cd C:\laragon2\www\api-assure\config
copy config.example.php config.php
notepad config.php
```

Renseignez les accès Oracle en reprenant **exactement** `host` et `service` de l’ancien  
`assureOriginal/BBBBB/AAAAA/connectionOci.php` (ou `CompteAssure/connectionOci.php`) :

```php
// Exemple legacy qui fonctionne :
// $hostname_oci = "172.17.15.201:1521";
// $database_oci = "PDB6";
'oracle' => [
    'host' => '172.17.15.201:1521',
    'service' => 'PDB6',
    ...
],
```

Si vous voyez **ORA-12514**, le listener Oracle ne connaît pas le service indiqué dans  
`config.php` (`PROD`, mauvaise IP, etc.) — corrigez `host` + `service`, puis redémarrez Apache.

**Attention** : l’ancien legacy `espaceAssure/.../connectionOci.php` utilise encore  
`172.17.15.10` + `PROD`. Seul `assureOriginal/BBBBB/AAAAA/connectionOci.php` utilise  
`172.17.15.201` + `PDB6`. Ne copiez pas le mauvais fichier.

### Diagnostic ORA-12514 sur le serveur (172.17.15.121)

1. Vérifier le fichier **réellement lu par Apache** :
   ```
   C:\laragon2\www\api-assure\config\config.php
   ```
   Il doit contenir exactement :
   ```php
   'host' => '172.17.15.201:1521',
   'service' => 'PDB6',
   'user' => 'dsi',
   'password' => 'Sdmi@2025',
   ```

2. Copier `public/diag-oracle.php` sur le serveur, puis **depuis le serveur** (RDP) :
   ```
   http://127.0.0.1:83/diag-oracle.php
   ```
   La réponse JSON affiche `host`, `service` et l’erreur Oracle réelle (sans le mot de passe).

3. Synchroniser le code API puis redémarrer Apache :
   ```powershell
   cd C:\chemin\vers\Energizer\backend-assure
   .\deploy\sync-to-laragon.ps1
   # Laragon → Stop All → Start All
   ```

4. Tester :
   ```powershell
   curl http://127.0.0.1:83/health?oracle=1
   ```

5. Si le DBA a validé la chaîne mais Easy Connect échoue, forcer dans `config.php` :
   ```php
   'connect' => '172.17.15.201:1521/PDB6',
   ```
   ou le descripteur TNS complet (voir `diag-oracle.php` → `tns_descriptor`).

6. Tester la même chaîne en **CLI PHP** (même binaire qu’Apache) :
   ```powershell
   C:\laragon2\bin\php\php-8.1.10-Win32-vs16-x64\php.exe -r ^
     "$l=oci_connect('dsi','Sdmi@2025','172.17.15.201:1521/PDB6'); var_dump($l);"
   ```
   Si CLI OK mais Apache KO → comparer `php.ini` et variable `TNS_ADMIN` entre CLI et Apache.

Générez une clé secrète longue pour `token_secret`.

Les origines CORS doivent inclure le frontend sur le port **82** (déjà dans `config.example.php`).

## 3. Apache — deux vhosts

### Port 82 — frontend uniquement

Copier `deploy/laragon/apache-energizer.conf` vers :

```
C:\laragon2\etc\apache2\sites-enabled\sapelli.conf
```

(Sans bloc `/api-assure` — l’API n’est plus sur ce port.)

### Port 83 — API PHP

1. Copier `deploy/laragon/api-assure.conf` vers :

```
C:\laragon2\etc\apache2\sites-enabled\api-assure.conf
```

2. Dans `C:\laragon2\etc\apache2\httpd.conf`, ajouter si absent :

```apache
Listen 83
```

3. Créer le dossier logs si besoin :

```powershell
New-Item -ItemType Directory -Force -Path C:\laragon2\logs
```

4. **Redémarrer Apache** (Laragon → Stop All → Start All).

## 4. Frontend — variables d’environnement

En production (build déployé sur `:82`) :

```env
VITE_ASSURE_LEGACY_AUTH=true
VITE_ASSURE_API_USE_PROXY=false
VITE_ASSURE_API_BASE_URL=http://172.17.15.121:83
```

Puis `npm run build` et copie de `dist/spa` vers `C:\laragon2\www\sapelli\`.

En développement (`quasar dev`), le proxy Vite `/api-assure` redirige vers le port **83**.

## 5. Test

```powershell
curl http://127.0.0.1:83/health
curl http://127.0.0.1:83/health/oracle
```

`/health/oracle` ou **`/health?oracle=1`** (dans le **navigateur**) affiche si Oracle est bien configuré.

Réponse attendue : `{"success":true,"service":"backend-assure",...}`

Connexion (exemple) :

```powershell
curl -X POST http://127.0.0.1:83/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"num_assu\":\"321-3216549-4\",\"mot2passe\":\"votre_mdp\"}"
```

Depuis le réseau :

```powershell
curl http://172.17.15.121:83/health
```

## 6. Lien avec l’ancienne page d’accueil

| Ancien (legacy)              | Nouveau                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| `.../CompteAssure/index.php` | Frontend Quasar : `http://172.17.15.121:82/#/assure-login` |
| `ConnFile.php`               | `POST http://172.17.15.121:83/auth/login`                  |
| `GererCompte.php`            | `POST http://172.17.15.121:83/account/register`            |
| `RenewRegFile.php`           | `POST http://172.17.15.121:83/account/password`            |
| `AjaxPieces.php`             | `GET http://172.17.15.121:83/account/types-piece`          |

## 7. PHP 8.1.10 (Laragon 6) — extensions requises

Le code `backend-assure` est écrit pour **PHP 8.1+** (pas de syntaxe obsolète PHP 5).

### Vérifier la version utilisée par Apache

```powershell
C:\laragon2\bin\php\php-8.1.10-Win32-vs16-x64\php.exe -v
```

(Chemin exact peut varier ; dans Laragon 6 : **Menu → PHP → Version** doit afficher **8.1.10**.)

### Activer Oracle (`oci8`)

1. Laragon 6 → **Menu** (clic droit sur l’icône) → **PHP** → **php.ini** (version 8.1.10)
2. Décommenter ou ajouter :
   ```ini
   extension=oci8_19  ; ou oci8_12c selon le DLL présent dans ext\
   ```
3. Vérifier :
   ```powershell
   C:\laragon2\bin\php\php-8.1.10-Win32-vs16-x64\php.exe -m | findstr oci8
   ```
4. **Redémarrer Apache** (Stop All → Start All)

Sans `oci8`, l’API répondra en erreur 500 dès un appel Oracle.

### Autres extensions (souvent déjà actives)

- `openssl` — jetons signés
- `json` — requêtes/réponses API
- `mbstring` — recommandé

### `mail()` (inscription compte)

Pour l’envoi du mot de passe par email à la création de compte, configurez `SMTP` dans `php.ini` ou le sendmail Laragon, comme sur l’ancien `CompteAssure`.

## 8. Logs

En cas d’erreur 500, vérifier :

- `C:\laragon2\logs\api-assure-error.log`
- `C:\laragon2\logs\sapelli-error.log` (frontend)
- Log PHP Laragon 6 : `C:\laragon2\bin\php\php-8.1.10-Win32-vs16-x64\logs\` ou **Laragon → Apache → Error log**
