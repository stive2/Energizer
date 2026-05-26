# Guide de test — Réception « Nouveau dossier » (EnergiZer)

Ce guide permet de tester **tous les cas de formulaire** (visibilité des champs, validations, télé-immatriculation, alertes).

**Fichiers liés :**

- `nouveauDossierTestData.js` — matricules, codes télé, valeurs communes
- `nouveauDossierTestScenarios.js` — scénarios par objet (programmatique)

---

## Accès

1. Connexion agent Energizer (session interne simulée).
2. Menu **Réception des nouveaux dossiers** ou URL : `/energizer/reception/nouveau-dossier`.
3. Bouton **Réceptionner un nouveau dossier** → choisir l’objet → remplir les champs **activés** (non grisés).
4. **Entrée** sur `numassu` ou `mat_employeur` pour préremplir via les mocks.
5. **Enregistrer** → retour à la liste des objets ; vérifier le tableau « Dossiers enregistrés ».

> Les mocks locaux s’appliquent si l’API backend est indisponible ou renvoie une liste vide. Option : `VITE_CNPS_API_FALLBACK_MOCK=true` dans `.env`.

---

## Références rapides

### Matricules assuré (`numassu` + touche Entrée)

| Matricule        | Effet attendu |
|------------------|---------------|
| `321-1234567-0`  | KAMGA Jean-Pierre — cas normal |
| `321-1256447-9`  | NKOA Sylvie — **alerte pré-dépôt PVID** (pension, hors survivants) |
| `321-8888888-1`  | FOTSO Martin — **alerte calcul pension** (objet PV usure prématurée) |

### Matricules employeur (`mat_employeur` + Entrée — reprise X / Z)

| Matricule        | Raison sociale |
|------------------|----------------|
| `321-1234567-A`  | ENTREPRISE DEMO SARL |
| `321-6549873-Z`  | SOCIETE NORD CAMEROUN |

### Codes télé-immatriculation

| Cas            | Objet à sélectionner              | Circuit                          | code_tele_enreg | code_secret   |
|----------------|-----------------------------------|----------------------------------|-----------------|---------------|
| Assuré OK      | `[TEST] Télé-immatriculation assuré` | TELE-IMMATRICULATION             | `DEMO-ASS-001`  | `secret2026`  |
| Employeur OK   | `Embauche / Cessation`            | TELE-IMMATRICULATION             | `DEMO-EMP-001`  | `secret2026`  |
| Doublon        | (idem télé)                       | (idem)                           | `DUPLICATE`     | `duplicate`   |
| Introuvable    | (idem télé)                       | (idem)                           | `INVALIDE`      | `xxx`         |

### Valeurs communes (à adapter selon champs activés)

| Champ | Valeur de test |
|-------|----------------|
| `nomcomplet` | MBALLA Paul Dépôtant |
| `datedemande` | 15/04/2026 |
| `adresse` | 123 Avenue de la Réunification, Yaoundé |
| `telephone` | 677123456 |
| `email` | depotant.demo@cnps.cm |
| `datecessation` | 01/01/2026 |
| `revision` | NON (ou OUI pour tester la confirmation) |
| `datedeces` | 20/03/2026 |
| `datedemandeassuredecede` | 25/03/2026 |
| `natureprestation` | Pension de Survivants |
| `dateaccident` | 05/01/2026 |
| `datedeclaration` | 10/01/2026 (≥ date accident) |
| `dateconstatinvalid` | 10/02/2025 |
| `dateconstatincapacite` | 12/02/2025 |
| `tauxinvalide` | 55 |
| `nomtiers` | CLINIQUE DEMO |
| `circuit` | ORDINAIRE / GED-LAD / TELE-IMMATRICULATION / C.F.C.E |

### Matricules invalides (validation rouge)

| Champ | Valeur |
|-------|--------|
| Assuré | `123-456` |
| Employeur | `999-INVALID` |

---

## Familles de cas (checklist)

| # | Cas | Exemples d’objets | Champs principalement activés |
|---|-----|-------------------|-------------------------------|
| 1 | Standard | Fournisseur, Courrier, Prestations Familiales, Allocations… | numassu, nomcomplet, datedemande, adresse, telephone, email |
| 2 | Pension (P) | Pension / Allocation vieillesse… | + datecessation, revision |
| 3 | Alerte PV | Pension Vieillesse Anticipée Usure Prématurée | numassu `321-8888888-1` |
| 4 | Pré-dépôt PVID | Toute pension sauf survivants | numassu `321-1256447-9` |
| 5 | Survivants | Allocation / Pension de Survivants | + datedeces, natureprestation, datedemandeassuredecede |
| 6 | Invalidité | Pension Invalidité | + tauxinvalide, dates invalidité/incapacité, dateaccident, nomtiers |
| 7 | RP (R) | Dossier MP, AT, rechute | + dateaccident, datedeclaration |
| 8 | Reprise | Reprise dossier assuré / employeur | bloc employeur, mat_employeur (assuré désactivé) |
| 9 | Télé employeur | Embauche / Cessation | codes DEMO-EMP, circuit TELE-IMMATRICULATION |
| 10 | Télé assuré | [TEST] Télé-immatriculation assuré | codes DEMO-ASS, circuit TELE-IMMATRICULATION |
| 11 | Révision OUI | Pension Vieillesse Normale | revision = OUI → confirmer le dialogue |
| 12 | GED-LAD | Objet standard | circuit = GED-LAD |

---

## Détail par objet (33 entrées)

| # | Objet | Cas | Champs activés | Valeurs clés | Notes |
|---|-------|-----|----------------|--------------|-------|
| 1 | Fournisseur | standard | numassu, nomcompletass, nomcomplet, datedemande, email, adresse, telephone, circuit | numassu: 321-1234567-0, nomcomplet: MBALLA Paul Dépôtant, datedemande: 15/04/2026 | |
| 2 | Locataire | standard | idem | idem | |
| 3 | Embauche / Cessation | tele_employeur | code_tele_enreg, code_secret, circuit, datedemande | Circuit TELE-IMMAT EMPLOYEUR, DEMO-EMP-001 / secret2026 | numassu désactivé |
| 4 | Prestations Familiales | standard | idem standard | idem | |
| 5 | Allocations Familiales | standard | idem | idem | |
| 6 | Allocation de Maternité | standard | idem | idem | |
| 7 | Allocations Prénatales | standard | idem | idem | |
| 8 | Frais Médicaux de Grossesse et de Maternité | standard | idem | idem | |
| 9 | Indemnités Journalières (Congés de Maternité) | standard | idem | idem | |
| 10 | Allocations Apériodiques | standard | idem | idem | |
| 11 | Courrier | standard | idem | idem | |
| 12 | Allocation de Survivants | survivants | + datedeces, datedemandeassuredecede, natureprestation | natureprestation: Pension de Survivants, datedeces: 20/03/2026 | |
| 13 | Frais de Transport suite à Convocation un Assuré | standard | idem | idem | |
| 14 | frais funéraires suite à décès… | standard | idem | idem | |
| 15 | Pension de Vieillesse Anticipée pour Usure Prématurée | pv_alerte | pension + numassu | numassu: 321-8888888-1 | Alerte calcul pension |
| 16 | Allocation de Vieillesse Anticipée pour Usure Prématurée | pension | + datecessation, revision | datecessation: 01/12/2025 | |
| 17 | Pension de Vieillesse Normale | pension | idem | revision: NON | Tester aussi revision OUI |
| 18 | Pension de Vieillesse Anticipée pour Convenance Personnelle | pension | idem | idem | |
| 19 | Allocation de Vieillesse Normale | pension | idem | idem | |
| 20 | Pension de Survivants | survivants | idem survivants | idem | |
| 21 | Pension Invalidité | invalidite | + taux, dates invalidité, accident, nomtiers | tauxinvalide: 55, nomtiers: CLINIQUE DEMO | |
| 22 | Dossier de Maladie Professionnelle | rp | + dateaccident, datedeclaration | 05/01/2026 → 10/01/2026 | |
| 23 | Dossier d Accident du Travail | rp | idem | idem | |
| 24 | Demande de contre visite | standard | idem | idem | |
| 25 | remboursement des frais medicaux… | standard | idem | idem | |
| 26 | Dossier de rechute | rp | idem RP | idem | |
| 27 | Demande Annuite Rente | standard | idem | idem | |
| 28 | Demande Rachat Rente | standard | idem | idem | |
| 29 | Demande d une Attestation pour Soumission | standard | idem | idem | |
| 30 | Reprise dossier assure | reprise | mat_employeur, champs employeur RO, datedemande | mat: 321-1234567-A | Assuré / déposant désactivés |
| 31 | Reprise dossier employeur | reprise | idem | idem | |
| 32 | [TEST] Télé-immatriculation assuré | tele_assure | code_tele_enreg, code_secret, circuit | DEMO-ASS-001 / secret2026 | Objet mock uniquement |
| 33 | — | revision_oui | (objet pension) | revision: OUI | Confirmer le dialogue CNPS |
| 34 | — | lad | (objet standard) | circuit: GED-LAD | lad = OUI côté serveur |

---

## Scénarios spéciaux à ne pas oublier

### Révision de droits (OUI)

1. Objet : **Pension de Vieillesse Normale** (ou autre pension).
2. Renseigner les champs obligatoires.
3. `revision` = **OUI** → confirmer **Oui** dans la boîte de dialogue.
4. Vérifier que la valeur reste OUI ; refaire avec **Non** → doit repasser à NON.

### Télé-immatriculation — enregistrement bloqué puis débloqué

1. Choisir circuit **TELE-IMMATRICULATION** (bloc import selon l’objet assuré / employeur).
2. Le bouton **Enregistrer** est désactivé tant que les codes ne sont pas valides.
3. Saisir les codes OK → champs client en lecture seule → **Enregistrer** activé.
4. Codes **DUPLICATE** → message dossier existant n° DOS-2026-TELE-99.

### Reprise dossier (X / Z)

1. Seuls **mat_employeur** et le bloc **Informations sur l’employeur** sont utilisables.
2. Entrée sur `321-1234567-A` → raison sociale, adresse, etc. remplis.

### Enregistrement (mock — sans backend)

| Cas | Comment déclencher | Message attendu |
|-----|-------------------|-----------------|
| Nominal | Courrier + champs remplis + **Enregistrer** | Succès + n° dossier `G321…` + écran de confirmation |
| Assuré inconnu | `numassu` = `999-INVALID` | Assuré absent du référentiel |
| Centre 001 | Forcer `code_centre` = `001` (session) avec assuré connu | Impossible d’enregistrer au centre 001 |
| Télé sans import | Circuit TELE sans codes / sans blur | Codes télé requis ou valider l’import |
| Télé doublon | Codes `DUPLICATE` / `duplicate` | Dossier télé déjà existant |
| Révision sans droits | Pension + `321-1256447-9` + revision OUI | Aucun droit en pension |
| AT doublon | RP + `321-1234567-0` + dates 05/01 et 10/01 | Accident déjà connu |

Après succès : le dossier apparaît dans le tableau de la page ; en production → `addpiece.jsp`.

### Validation formulaire

- Champs **grisés** : pas de règle obligatoire.
- Dates : ne doivent pas être **postérieures** à aujourd’hui.
- `datedeclaration` ≥ `dateaccident` (AT / MP).
- Circuit télé **3** sans codes → message d’erreur à l’enregistrement.

---

## Utilisation en code

```javascript
import { getTestScenarioForObjet } from 'src/modules/energizer/data/nouveauDossierTestScenarios.js'
import { NOUVEAU_DOSSIER_TEST_CHECKLIST } from 'src/modules/energizer/data/nouveauDossierTestScenarios.js'
import { NOUVEAU_DOSSIER_COMMON_FORM, NOUVEAU_DOSSIER_TELE_CODES } from 'src/modules/energizer/data/nouveauDossierTestData.js'

const scenario = getTestScenarioForObjet('Pension Invalidité')
// scenario.champsActifs, scenario.valeurs, scenario.notes

const allCases = NOUVEAU_DOSSIER_TEST_CHECKLIST // 33 lignes
```

---

## Parcours de test recommandé (ordre)

1. **Courrier** — cas standard complet (référence).
2. **Pension de Vieillesse Normale** — cessation + revision NON.
3. **Pension de Vieillesse Anticipée pour Usure Prématurée** — alerte PV (`321-8888888-1`).
4. **Allocation de Survivants** — décès + nature prestation.
5. **Pension Invalidité** — taux + dates + tiers.
6. **Dossier d Accident du Travail** — accident + déclaration.
7. **Reprise dossier assure** — employeur seul.
8. **Embauche / Cessation** — télé employeur.
9. **[TEST] Télé-immatriculation assuré** — télé assuré.
10. **Révision OUI** sur une pension.
11. **GED-LAD** sur un objet standard.

---

*Dernière mise à jour : aligné sur `nouveauDossierTestScenarios.js` et les mocks `nouveauDossierMocks.js`.*
