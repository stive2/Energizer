/**
 * Pré-remplit le formulaire depuis infoassuretele.jsp (modification dossier).
 * @param {object} form
 * @param {Record<string, string>} row
 * @param {{
 *   arrondissements?: object[],
 *   pays?: object[],
 *   pieces?: object[],
 *   centres?: object[],
 *   matrimonial?: object[],
 * }} [referentials]
 */
export function applyAssureTeleToForm(form, row, referentials = {}) {
  if (!row) return

  const arrondissements = referentials.arrondissements ?? []
  const paysList = referentials.pays ?? []
  const pieces = referentials.pieces ?? []
  const centres = referentials.centres ?? []
  const matrimonial = referentials.matrimonial ?? []

  const findArrond = (codeOrName) => {
    if (!codeOrName) return null
    return (
      arrondissements.find((a) => a.CODE_ARROND === codeOrName) ||
      arrondissements.find((a) => a.NOM_ARROND === codeOrName) ||
      null
    )
  }

  const findPays = (codeOrNat) => {
    if (!codeOrNat) return null
    return (
      paysList.find((p) => p.code_pays === codeOrNat) ||
      paysList.find((p) => p.nationalite === codeOrNat) ||
      null
    )
  }

  const findPiece = (codeOrLib) => {
    if (!codeOrLib) return null
    return (
      pieces.find((p) => p.NUM_TYPEPIECE === codeOrLib) ||
      pieces.find((p) => p.LIBELLE === codeOrLib) ||
      null
    )
  }

  const findCentre = (codeOrLib) => {
    if (!codeOrLib) return null
    return (
      centres.find((c) => c.CODE_CENTRE === codeOrLib) ||
      centres.find((c) => c.LIB_CENTRE === codeOrLib) ||
      null
    )
  }

  const findMatrimonial = (codeOrLib) => {
    if (!codeOrLib) return null
    return (
      matrimonial.find((m) => m.CODE_MATRI === codeOrLib) ||
      matrimonial.find((m) => m.LIBELLE_MATRI === codeOrLib) ||
      null
    )
  }

  if (row.NUM_EMPLOYEUR) {
    form.mat_employeur = row.NUM_EMPLOYEUR
  } else {
    form.RAISON_SOCIALE = row.RAISON_SOCIALE || form.RAISON_SOCIALE
    form.NOM_COMMERCIAL = row.NOM_COMMERCIAL || form.NOM_COMMERCIAL
    form.ADRESSE_EMPLOYEUR = row.ADRESSE_EMPLOYEUR || form.ADRESSE_EMPLOYEUR
  }

  form.EFFECTIF_APPROX = row.EFFECTIF_APPROX ?? form.EFFECTIF_APPROX
  form.DATE_EMB_PRE_SALL = row.DATE_DEB_EMPL_ASSU || form.DATE_EMB_PRE_SALL
  form.CODE_categ = row.CATEGORIE ?? form.CODE_categ
  form.CODE_echelon = row.ECHELON ?? form.CODE_echelon
  form.NiveauAss = row.NIVEAU_ETUDE || form.NiveauAss
  form.Specialite = row.QUALIFICATION || form.Specialite
  form.ActuelRevenu = row.REVENU_MENSUEL ?? form.ActuelRevenu

  form.NOM_PERS = row.NOM_ASSU || form.NOM_PERS
  form.PRENOM_PERS = row.PRENOM_ASSU || form.PRENOM_PERS
  form.DATE_NAISS_PERS = row.DATE_NAISS_ASSU || form.DATE_NAISS_PERS
  form.LOCALITE_NAISS = row.LIEU_NAISS_ASSU || form.LOCALITE_NAISS
  form.LIEU_NAISS_PERS = row.CODE_ARROND_NAISS_ASSU || form.LIEU_NAISS_PERS
  form.LieuNaiss = findArrond(row.CODE_ARROND_NAISS_ASSU) || findArrond(row.ARROND_NAISS_ASSU)
  form.CODE_PAYS_NAISS = row.CODE_PAYS_NAISS_ASSU || form.CODE_PAYS_NAISS

  const sexe = row.SEXE_ASSU
  if (sexe === 'FEMININ' || sexe === 'F' || sexe === '1') form.SEXE_PERS = 'FEMININ'
  if (sexe === 'MASCULIN' || sexe === 'M' || sexe === '2') form.SEXE_PERS = 'MASCULIN'

  form.civilite = findMatrimonial(row.CODE_SIT_FAM_ASSU) || findMatrimonial(row.LIBELLE_MATRI)
  form.CIVILITE_PERS = row.CODE_SIT_FAM_ASSU || form.CIVILITE_PERS
  form.NATIONALITEC = findPays(row.CODE_PAYS_NAT_ASSU) || findPays(row.NATIONALITE)
  form.NATIONALITE = row.CODE_PAYS_NAT_ASSU || form.NATIONALITE

  form.typepiece = findPiece(row.CODE_PIECE_IDENT_ASSU) || findPiece(row.LIB_TYPEPIECEIDENTITE)
  form.NUM_TYPEPIECE = row.CODE_PIECE_IDENT_ASSU || form.NUM_TYPEPIECE
  form.NUM_PIECE = row.NUM_PIECE_IDENT_ASSU || form.NUM_PIECE
  form.DATE_PIECE = row.DATE_PIECE_ASSU || form.DATE_PIECE
  form.LIEU_PIECE = row.LIEU_PIECE_ASSU || form.LIEU_PIECE
  form.LIEU_PIECEC = findArrond(row.LIEU_PIECE_ASSU) || findArrond(row.ARROND_PIECE_ASSU)

  form.CODE_VILLE = row.CODE_ARROND_QUARTIER_ASSU || form.CODE_VILLE
  form.CODE_VILLEC = findArrond(row.CODE_ARROND_QUARTIER_ASSU) || findArrond(row.VILLE_ASSU)
  form.QUARTIER = row.QUARTIER_ASSU || form.QUARTIER
  form.TEL_PERS = row.TEL_ASSU || form.TEL_PERS
  form.FAX_PERS = row.FAX_ASSU || form.FAX_PERS
  form.BP = row.BP_ASSU || form.BP
  form.EMAIL_PERS = row.EMAIL_ASSU || form.EMAIL_PERS
  form.Adresse = row.ADRESSE_ASSU || form.Adresse

  form.NOM_MERE = row.NOM_MERE_ASSU || form.NOM_MERE
  form.PRENOM_MERE = row.PRENOM_MERE_ASSU || form.PRENOM_MERE
  form.DATE_NAISS_PERSM = row.DATE_NAISS_MERE_ASSU || form.DATE_NAISS_PERSM
  form.LOCALITE_NAISS_MERE = row.LIEU_NAISS_MERE_ASSU || form.LOCALITE_NAISS_MERE
  form.LIEU_NAISS_MERE = row.CODE_ARROND_NAISS_MERE || form.LIEU_NAISS_MERE
  form.LieuNaissMere = findArrond(row.CODE_ARROND_NAISS_MERE) || findArrond(row.ARROND_NAISS_MERE)

  form.NOM_PERE = row.NOM_PERE_ASSU || form.NOM_PERE
  form.PRENOM_PERE = row.PRENOM_PERE_ASSU || form.PRENOM_PERE
  form.DATE_NAISS_PERSP = row.DATE_NAISS_PERE || form.DATE_NAISS_PERSP
  form.LOCALITE_NAISS_PERE = row.LIEU_NAISS_PERE || form.LOCALITE_NAISS_PERE
  form.LIEU_NAISS_PERE = row.CODE_ARROND_NAISS_PERE || form.LIEU_NAISS_PERE
  form.LieuNaissPere = findArrond(row.CODE_ARROND_NAISS_PERE) || findArrond(row.ARROND_NAISS_PERE)

  form.CODE_CENTRECNPS = row.CODE_CENTRE_PREF || form.CODE_CENTRECNPS
  form.CODE_CENTRECNPSC = findCentre(row.CODE_CENTRE_PREF) || findCentre(row.LIB_CENTRE_PREF)

  if (row.NUM_DOSSIER) {
    form._dossierExploite = true
  }

  form.laction = 'Modifier'
}

/**
 * Champs affiliation régime volontaire (infoassuretele.jsp).
 * @param {object} form
 * @param {Record<string, string>} row
 * @param {{ origineRevenu?: object[] }} [referentials]
 */
export function applyAssureTeleVolFields(form, row, referentials = {}) {
  if (!row) return

  const origineList = referentials.origineRevenu ?? []
  const findOrigine = (code, lib) => {
    if (!code && !lib) return null
    return (
      origineList.find((o) => o.CODE_ORIGINEREV === code) ||
      origineList.find((o) => o.LIB_ORIGINEREV === lib) ||
      origineList.find((o) => o.LIB_ORIGINEREV === row.ORIGINE_REVENU) ||
      null
    )
  }

  if (row.DATE_DEBUT_AFFI) {
    form.DATE_DEBUT_AFFI = row.DATE_DEBUT_AFFI
    form.DATE_DEBUT_AFFI_SOLL = row.DATE_DEBUT_AFFI_SOLL || row.DATE_DEBUT_AFFI
  }
  if (row.ORIGINE_REVENU) {
    form.DETAILS_ORIGINEREV = row.ORIGINE_REVENU
  }
  if (row.MONTANT_REV_ANNUEL != null && row.MONTANT_REV_ANNUEL !== '') {
    form.MONTANT_REV_ANNUEL = row.MONTANT_REV_ANNUEL
  }
  if (row.ASSIETTE_COTISATION != null && row.ASSIETTE_COTISATION !== '') {
    form.ASSIETTE_COTISATION = row.ASSIETTE_COTISATION
  }
  if (row.TAUX_COTISATION != null && row.TAUX_COTISATION !== '') {
    const taux = Number(String(row.TAUX_COTISATION).replace(',', '.'))
    if (!Number.isNaN(taux)) {
      form.TAUX = String(taux)
      form.taux = String(taux)
    }
  }
  if (row.MONTANT_COTISATION != null && row.MONTANT_COTISATION !== '') {
    form.MONTANT_COTISATION = String(row.MONTANT_COTISATION)
  } else if (
    row.ASSIETTE_COTISATION != null &&
    row.TAUX_COTISATION != null &&
    !Number.isNaN(Number(row.ASSIETTE_COTISATION)) &&
    !Number.isNaN(Number(row.TAUX_COTISATION))
  ) {
    form.MONTANT_COTISATION = String(
      Math.ceil(
        (Number(row.ASSIETTE_COTISATION) *
          Number(String(row.TAUX_COTISATION).replace(',', '.'))) /
          100,
      ),
    )
  }
  if (row.CODE_ORIGINEREV) {
    form.CODE_ORIGINEREV = row.CODE_ORIGINEREV
    form.ORIGINE_REVENU = findOrigine(row.CODE_ORIGINEREV, row.LIB_ORIGINEREV) || form.ORIGINE_REVENU
    if (form.ORIGINE_REVENU && typeof form.ORIGINE_REVENU === 'object') {
      form.CODE_REGIMEAV = form.ORIGINE_REVENU.CODE_REGIME || row.CODE_REGIME || form.CODE_REGIMEAV
    }
  }
}
