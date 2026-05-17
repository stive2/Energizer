import { normalizeMatriculeEmployeur } from '../depotPrestationPfUtils.js'

/** Référence métier — employeur de démonstration (appel API fictif). */
export const FICTIF_EMPLOYEUR_CAMTEL = {
  numeroEmployeur: '010-1138701-H',
  matricule: '010-1138701-H',
  raisonsociale: 'CAMEROON TELECOMMUNICATIONS',
  NOM_COMMERCIAL: 'CAMEROON TELECOMMUNICATIONS',
  ADRESSE_EMPLOYEUR: 'Douala, Cameroun',
  DATE_EMB_PREM_TRAV: '01/05/2025',
  EFFECTIF_APPROX: 1200,
}

const FICTIF_REGISTRE_EMPLOYEURS = [FICTIF_EMPLOYEUR_CAMTEL]

function delay(ms = 400) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Simule GET /assure/depot-pf/employeur?matricule=…
 * @param {string} matricule
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function fictifApiRechercheEmployeurParMatricule(matricule) {
  await delay()

  const normalized = normalizeMatriculeEmployeur(matricule)
  const row = FICTIF_REGISTRE_EMPLOYEURS.find(
    (e) => normalizeMatriculeEmployeur(e.numeroEmployeur) === normalized,
  )

  if (!row) {
    const error = new Error('Employeur non trouvé')
    error.code = 'EMPLOYEUR_NOT_FOUND'
    throw error
  }

  return {
    success: true,
    data: { ...row },
  }
}
