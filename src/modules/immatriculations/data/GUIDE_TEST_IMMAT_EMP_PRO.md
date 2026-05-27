# Guide de test — Immatriculation employeur professionnel

Référence legacy : `teleImmat_0.1/WebContent/immat/tele_imma_employeur1.jsp` + `imma_employeur1.js`  
POST : `../GererEmployeur` (`TYPE_EMPLOYEUR=1`)

## Objectif de vérification

- Les noms des champs envoyés au backend restent identiques au legacy.
- Les validations métier legacy sont respectées.
- Les comportements de champs dépendants (codes cachés, mapping centres, activité) sont respectés.

## Cas nominal (UI)

1. **Origines**
   - `CAUSE_IMMA = 0` (Spontanée)
   - `CIRCUIT_DOSSIER = 4` (CFCE)

2. **Employeur**
   - `RAISON_SOCIALE`, `NOM_COMMERCIAL`, `ADRESSE_EMPL`, `NOM_QUARTIER`, `EMAIL`, `TEL`, `DATE_DEB_SERVICE`
   - `num_registre` et `num_contr` remplis pour un test complet

3. **Données fiscales**
   - `NATURE_JURC` (code nature juridique)
   - `CODE_SECT_ACTIVITEC` (code activité) -> remplit `CODE_REGIME`, `CODE_GPE_RISQUE`, `A_VERIFIER`
   - `CODE_CENTREIMPOTC` -> renseigne `CODE_CENTREIMPOT` et préremplit `CODE_CENTRECNPSC`
   - `CODE_CENTRECNPSC` -> renseigne `CODE_CENTRECNPS`

4. **Responsable**
   - `NOM_PERSEMPL`, `DATE_NAISS_PERSEMPL`, `LOCALITE_NAISS_PERSEMPL`, `LieuNaissPe`, `SEXE_PERSEMPL`,
     `NATIONALITEC`, `ADR_PERSEMPL`, `TEL_PERSEMPL`, `EMAIL_PERSEMPL`
   - `NUM_TYPEPIECE` + `NUM_PIECE` + `DATE_PIECE` + `LIEU_PIECEC`

5. **Fichiers**
   - Extensions legacy acceptées : `.gif`, `.jpg`, `.jpeg`, `.png` (max 3 Mo)
   - Pièces clés : `35`, `40`, `41`, `159`, `37`, `38`, `36`, `39`, `126` + pièce dynamique `NUM_TYPEPIECE`

## Règles métier legacy

- Si `DATE_EFFET` renseignée :
  - `DATE_DEB_SERVICE <= DATE_EFFET`
  - `DATE_EFFET <= aujourd'hui`
- `DATE_DEB_SERVICE`, `date_creation_empl`, `DATE_NAISS_PERSEMPL`, `DATE_PIECE` ne doivent pas être futures.
- Si `A_VERIFIER != '0'`, `num_registre` obligatoire.
- Si `num_registre` rempli, `date_creation_empl` obligatoire.
- Si `A_VERIFIER == '0'`, `num_contr` obligatoire.

## Données de test prêtes à l'emploi

Utiliser l'objet `immatEmpProTestForm` dans `immatEmpProTestData.js`.
