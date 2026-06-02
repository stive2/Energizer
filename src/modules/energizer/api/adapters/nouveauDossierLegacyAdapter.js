/**
 * Normalise les lignes JSON renvoyées par nouvDossier.jsp / naturePrestation.jsp.
 */

/** @param {Record<string, unknown>[]} rows */
export function normalizeNouveauDossierObjets(rows = []) {
  return rows
    .map((row) => ({
      libelle_type_pres: String(row.libelle_type_pres ?? '').trim(),
      code_centre_user: String(row.code_centre_user ?? '').trim(),
      code_pres: String(row.code_pres ?? row.code_type_pres ?? '').trim(),
      code_natu_pres: String(row.code_natu_pres ?? '').trim(),
      today: String(row.today ?? '').trim(),
    }))
    .filter((row) => row.libelle_type_pres)
}

/** @param {Record<string, unknown>[]} rows */
export function normalizeNaturePrestations(rows = []) {
  return rows
    .map((row) => ({
      libelle_type_pres: String(row.libelle_type_pres ?? '').trim(),
      code_centre_user: String(row.code_centre_user ?? '').trim(),
      code_pres: String(row.code_pres ?? row.code_type_pres ?? '').trim(),
      code_natu_pres_register: String(
        row.code_natu_pres_register ?? row.code_natu_pres ?? '',
      ).trim(),
    }))
    .filter((row) => row.libelle_type_pres)
}

/** @param {Record<string, unknown>[]} rows */
export function normalizeTypeCircuits(rows = []) {
  return rows
    .map((row) => ({
      code_circuit: String(row.code_circuit ?? '').trim(),
      libelle_circuit: String(row.libelle_circuit ?? '').trim(),
    }))
    .filter((row) => row.libelle_circuit)
}

/** Lignes get/get_dossier.jsp (jAccueil.jsp). */
export function normalizeSavedDossiersFromLegacy(rows = []) {
  return rows
    .map((row) => {
      const num_dossier = String(row.num_dossier ?? '').trim()
      if (!num_dossier) return null
      const date_enreg = String(row.date_enreg ?? row.date_situ ?? '').trim()
      return {
        id: num_dossier,
        num_dossier,
        numassu: String(row.num_assu ?? '').trim(),
        nomcomplet: String(row.nom_requerant ?? '').trim(),
        objet: String(row.myObjet ?? row.Obj ?? row.objet ?? '').trim(),
        code_situ: String(row.code_situ ?? '').trim(),
        localisation: String(row.localisation ?? '').trim(),
        telephone: String(row.tel ?? '').trim(),
        adresse: String(row.adresse ?? '').trim(),
        myobjet: String(row.myObjet ?? '').trim(),
        datedemande: String(row.date_demande ?? '').trim(),
        date_enreg,
        createdAt: date_enreg,
        initiateur: String(row.initiateur ?? '').trim(),
        observations: String(row.observations ?? '').trim(),
      }
    })
    .filter(Boolean)
}

/** Corbeille jAccueil — même source que get_dossier.jsp. */
export function normalizeJaccueilRowsFromLegacy(rows = []) {
  return normalizeSavedDossiersFromLegacy(rows).map((row) => ({
    num_dossier: row.num_dossier,
    nom_requerant: row.nomcomplet,
    telephone: row.telephone,
    adresse: row.adresse,
    myobjet: row.myobjet || row.objet,
    datedemande: row.datedemande,
    etape: row.localisation || 'Accueil',
    date_position: row.date_enreg || row.datedemande,
    code_situ: row.code_situ,
  }))
}
