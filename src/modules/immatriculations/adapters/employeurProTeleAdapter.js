/**
 * Applique infoemployeurtele.jsp sur le formulaire ImmatEmpPro (imma_employeur1.js type 2).
 * @param {object} form
 * @param {Record<string, string>} row
 * @returns {{ exploited?: boolean }}
 */
export function applyEmployeurProTeleToForm(form, row) {
  if (!row) return {}

  if (row.num_dossier != null && String(row.num_dossier).trim() !== '') {
    return { exploited: true }
  }

  const set = (key, val) => {
    if (val != null && String(val).trim() !== '') form[key] = val
  }

  set('RAISON_SOCIALE', row.raison_sociale)
  set('NOM_COMMERCIAL', row.nom_commercial)
  set('Sigle', row.sigle)
  set('ADRESSE_EMPL', row.adresse_employeur)
  set('BOITE_POSTALE', row.boite_postale)
  set('EMAIL', row.email)
  set('TEL', row.tel)
  set('num_registre', row.reg_commerce)
  set('NATURE_JURC', row.nat_jurid)
  set('NBRE_EMPL', row.nbre_sal)
  set('DATE_EFFET', row.ddate_emb_prem_sal || row.date_emb_prem_sal)
  set('num_contr', row.num_contr)
  set('NOM_QUARTIER', row.nom_quartier)
  set('DATE_DEB_SERVICE', row.ddate_deb_service || row.date_deb_service)
  set('LIEUDIT_EMPL', row.lieudit_empl)
  set('date_creation_empl', row.ddate_creation || row.date_creation)
  set('NOM_PERSEMPL', row.nom_pers)
  set('PRENOM_PERSEMPL', row.prenom_pers)
  set('SEXE_PERSEMPL', row.sexe_pers)
  set('DATE_NAISS_PERSEMPL', row.ddate_naiss_pers || row.date_naiss_pers)
  set('LieuNaissPe', row.code_lieu_naiss)
  set('LOCALITE_NAISS_PERSEMPL', row.localite_naiss_promoteur)
  set('num_case', row.num_case)
  set('CODE_ARRONDC', row.code_arrond)
  set('CODE_SECT_ACTIVITEC', row.code_sect_activite)
  set('CODE_CENTREIMPOTC', row.code_cdi)
  set('CODE_CENTRECNPSC', row.code_centre)
  set('NATIONALITEC', row.code_pays_nat_promoteur)
  set('NUM_TYPEPIECE', row.num_typepiece)
  set('NUM_PIECE', row.num_piece)
  set('DATE_PIECE', row.ddate_piece || row.date_piece)
  set('LIEU_PIECEC', row.code_lieu_piece)
  set('TEL_PERSEMPL', row.tel_promoteur)
  set('BP_PERSEMPL', row.bp_promoteur)
  set('ADR_PERSEMPL', row.adr_promoteur)
  set('EMAIL_PERSEMPL', row.email_promoteur)
  set('AUTRE_CONTACT', row.autre_contact)
  set('CODE_REGIME', row.code_regime_cnps)
  set('CODE_GPE_RISQUE', row.code_gpe_risque)

  if (row.code_circuit != null && String(row.code_circuit).trim() !== '') {
    form.CIRCUIT_DOSSIER = String(row.code_circuit)
  }

  if (row.num_empl_siege) {
    form.NUM_EMPL_SIEGE = row.num_empl_siege
    form.isSuccursale = true
  }

  form.laction = 'Modifier'

  return { exploited: false, needsSiegeLookup: Boolean(row.num_empl_siege) }
}

/**
 * Remplit les champs siège depuis toutesentreprises.jsp (completeEmpl type e).
 * @param {object} form
 * @param {Record<string, string>} employer
 * @returns {{ warning?: string }}
 */
export function applySiegeEmployeurToForm(form, employer) {
  if (!employer) return {}

  form.RAISON_SOCIALE_SIEGE = employer.RAISON_SOCIALE || form.RAISON_SOCIALE_SIEGE
  form.NOM_COMMERCIAL_SIEGE = employer.NOM_COMMERCIAL || form.NOM_COMMERCIAL_SIEGE

  let warning
  if (employer.POSITION && String(employer.POSITION) !== '1') {
    warning = employer.LIB_POSITION
      ? `Cet employeur est ${employer.LIB_POSITION}`
      : "La position de l'employeur n'est pas active."
  }

  return { warning }
}
