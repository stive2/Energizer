# Guide de test — Immatriculation employeur domestique (ImmatEmpDom)

Référence legacy : `teleImmat_0.1/WebContent/immat/tele_imma_employeur0.jsp` + `imma_employeur0.js`  
POST : `../GererEmployeur` — `TYPE_EMPLOYEUR = 0`

## En-tête du formulaire

| Champ Quasar | Valeur test | Legacy |
|--------------|-------------|--------|
| `CAUSE_IMMA` | `0` (Spontanée) ou `1` (Suite à contrôle) | id store causeimma |
| `CIRCUIT_DOSSIER` | `4` (CFCE) ou `3` (AUTRE) | id store origine |

## Étape 1 — Responsable

| Champ | Valeur test |
|-------|-------------|
| `NOM_PERSEMPL` | NDJENG |
| `PRENOM_PERSEMPL` | MARIE CLAIRE |
| `DATE_NAISS_PERSEMPL` | 15/03/1985 (≤ aujourd’hui) |
| `LOCALITE_NAISS_PERSEMPL` | BAFOUSSAM |
| `LieuNaissPe` | YAOUNDE I (`C1601`) |
| `SEXE_PERSEMPL` | F |
| `NATIONALITEC` | CAMEROUNAISE (`CMR`) |
| `PROFESSION` | GERANTE (optionnel) |
| `NUM_TYPEPIECE` | 56 — Carte Nationalité d Identité |
| `NUM_PIECE` | 123456789 |
| `DATE_PIECE` | 01/06/2018 |
| `LIEU_PIECEC` | arrondissement délivrance (`C16011`) |
| Fichier pièce | `identite_test.jpg` — clé POST = valeur `NUM_TYPEPIECE` (ex. `56`) |

## Étape 2 — Adresse

| Champ | Valeur test |
|-------|-------------|
| `ADRESSE_EMPL` | QUARTIER ADMINISTRATIF |
| `BOITE_POSTALE` | 11852 |
| `TEL` | 222334455 |
| `TEL_PERSEMPL` | 677112233 |
| `EMAIL` | employeur.domestique@test.cm |
| `CODE_ARRONDC` | YAOUNDE II (`C16011`) — optionnel |
| `NOM_QUARTIER` | ESSOS |
| `LIEUDIT_EMPL` | FACE STADE |
| `num_case` | LOT 12 B |
| Fichier `40` | `plan_test.png` (gif/jpg/png/doc/docx) |

## Étape 3 — Activité

| Champ | Valeur test |
|-------|-------------|
| `DATE_DEB_SERVICE` | 01/01/2024 (≤ `DATE_EFFET`, ≤ aujourd’hui) |
| `DATE_EFFET` | 01/06/2024 (≤ aujourd’hui) |
| `NBRE_EMPL` | 3 |
| `CODE_CENTREIMPOTC` | CDI 1BIS… (`321904`) |
| `CODE_CENTRECNPSC` | CPS-YAOUNDE… (`321`) — prérempli via impôts |
| Fichier `41` | `liste_travailleurs.xlsx` |

## Étape 4 — Validation

- Récapitulatif puis **Soumettre**
- Dialogue : **Valider définitivement ?** → Oui (`valider=1`, `etatValid=1`) ou Non (`0`)

## Règles métier (legacy)

1. `DATE_DEB_SERVICE` ≤ `DATE_EFFET`
2. `DATE_EFFET`, `DATE_DEB_SERVICE`, `DATE_NAISS_PERSEMPL`, `DATE_PIECE` : pas de date future

## Champs cachés envoyés au backend

`TYPE_EMPLOYEUR=0`, `CODE_REGIME=9`, `CODE_GPE_RISQUE=A`, `objet=Empl`, `laction=Creer`,  
`CAUSEIMMA`, `CIRCUITDOSSIER`, `LIEU_NAISS_PERSEMPL`, `NATIONALITE`, `LIEU_PIECE`, `CODE_ARROND`,  
`CODE_CENTREIMPOT`, `CODE_CENTRECNPS`, `valider`, `etatValid`, etc.

## Données programmatiques

Voir `immatEmpDomTestData.js` pour un objet `immatEmpDomTestForm` réutilisable en dev.

## Mock API

Sans backend, `submitGererEmployeur` renvoie un succès mock via `callApi`.
