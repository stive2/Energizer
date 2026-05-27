import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { NOUVEAU_DOSSIER_TEST_EMPLOYEURS } from 'src/modules/energizer/data/nouveauDossierTestData.js'

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

const DEMO_EMPLOYEURS_NOUVEAU_DOSSIER = Object.entries(NOUVEAU_DOSSIER_TEST_EMPLOYEURS).map(
  ([matricule, row]) => ({
    numeroEmployeur: matricule,
    matricule,
    raisonsociale: row.RAISON_SOCIALE,
    RAISON_SOCIALE: row.RAISON_SOCIALE,
    NOM_COMMERCIAL: row.RAISON_SOCIALE,
    ADRESSE_EMPLOYEUR: row.ADRESSE_EMPLOYEUR,
    DATE_EMB_PREM_TRAV: '',
    EFFECTIF_APPROX: '',
  }),
)

const FICTIF_REGISTRE_EMPLOYEURS = [
  FICTIF_EMPLOYEUR_CAMTEL,
  ...DEMO_EMPLOYEURS_NOUVEAU_DOSSIER,
]

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
