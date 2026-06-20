# Backend API — Espace assuré CNPS

API PHP JSON pour **l'authentification et la gestion de compte** assuré, inspirée de `assureOriginal`.

Les **prestations familiales** (choix, formulaires, dépôt) sont gérées côté frontend via **teleImmat_0.1** (proxy `/tele-immat`), pas par cette API.

## Déploiement Laragon2

API sur le **port 83** (vhost dédié). Voir [deploy/laragon/GUIDE-BACKEND-ASSURE.md](../deploy/laragon/GUIDE-BACKEND-ASSURE.md)

## Endpoints

| Méthode | Route | Legacy |
|---------|-------|--------|
| GET | `/health` | — |
| POST | `/auth/login` | `ConnFile.php` |
| POST | `/auth/logout` | `logout.php` |
| GET | `/auth/me` | session profil |
| POST | `/auth/reactivate` | `Reactivate.php` |
| GET | `/account/{mat}/profile` | `AjaxNewAccount.php` / lookup |
| GET | `/account/types-piece` | `AjaxPieces.php` |
| POST | `/account/register` | `GererCompte.php` |
| POST | `/account/password` | `RenewRegFile.php` / `RegFile.php` |
| GET | `/assure/home` | `ConsultCompte.php` (accueil) |

## Configuration

```powershell
copy config\config.example.php config\config.php
# Éditer Oracle + token_secret
```

Clés importantes dans `config.php` :

- `token_secret` — signature JWT session assuré
- `oracle` — connexion JASSURE / COMPTE_ASSU

## Test local (avec PHP + oci8)

```bash
php -S localhost:8030 -t public
curl http://localhost:8030/health
```
