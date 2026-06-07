import {
  firstLegacyRow,
  parseLegacyRoot,
} from 'src/modules/immatriculations/adapters/legacyJsonAdapter.js'
import { getLegacyJsp, postLegacyJsp } from './teleImmatClient.js'
import { isTeleImmatLegacyEnabled } from 'src/modules/shared/config/teleImmat.js'

/** JSP alignés imma_employeur1.js (dossier teleImmat_0.1/immat/). */
const JSP = {
  infoEmployeurTele: '/immat/infoemployeurtele.jsp',
  toutesEntreprises: '/immat/toutesentreprises.jsp',
  lanaturejur: '/immat/lanaturejur.jsp',
  lactiviteeconomique: '/immat/lactiviteeconomique.jsp',
  lepays: '/immat/lepays.jsp',
  lestypepiecesId: '/immat/lestypepiecesId.jsp',
  larrondissement: '/immat/larrondissement.jsp',
  lecentreimpot: '/immat/lecentreimpot.jsp',
  lecentrecnps: '/immat/lecentrecnps.jsp',
}

const REFERENTIAL_LABELS = {
  lanaturejur: 'Formes juridiques',
  lactiviteeconomique: 'Activités économiques',
  lepays: 'Nationalités',
  lestypepiecesId: "Types de pièce d'identité",
  larrondissement: 'Arrondissements',
  lecentreimpot: 'Centres des impôts',
  lecentrecnps: 'Centres CNPS',
}

function assertLegacyEnabled() {
  if (!isTeleImmatLegacyEnabled()) {
    throw new Error(
      'Télé-immatriculation employeur indisponible : définissez VITE_TELE_IMMAT_USE_LEGACY=true.',
    )
  }
}

function normalizeEmployerMatricule(matricule) {
  return String(matricule || '')
    .trim()
    .toUpperCase()
}

async function fetchEmployeurReferentialJsp(key) {
  const path = JSP[key]
  if (!path) return []
  const timeout = key === 'larrondissement' ? 180_000 : undefined
  try {
    const data = await getLegacyJsp(path, {}, { timeout })
    return parseLegacyRoot(data)
  } catch (error) {
    const label = REFERENTIAL_LABELS[key] || key
    const msg = error?.message || String(error)
    throw new Error(`${label} (${path}) : ${msg}`)
  }
}

/**
 * Référentiels employeur professionnel — stores ExtJS imma_employeur1.js.
 * @returns {Promise<{
 *   formeJuridique: Record<string, string>[],
 *   activites: Record<string, string>[],
 *   pays: Record<string, string>[],
 *   pieces: Record<string, string>[],
 *   arrondissements: Record<string, string>[],
 *   impots: Record<string, string>[],
 *   centres: Record<string, string>[],
 * }>}
 */
export async function fetchImmatEmpProReferentials() {
  assertLegacyEnabled()

  const keys = [
    'lanaturejur',
    'lactiviteeconomique',
    'lepays',
    'lestypepiecesId',
    'larrondissement',
    'lecentreimpot',
    'lecentrecnps',
  ]

  const results = await Promise.all(
    keys.map(async (key) => {
      const rows = await fetchEmployeurReferentialJsp(key)
      if (!rows.length) {
        const label = REFERENTIAL_LABELS[key] || key
        throw new Error(`${label} : réponse vide (${JSP[key]}).`)
      }
      return [key, rows]
    }),
  )

  const byKey = Object.fromEntries(results)
  return {
    formeJuridique: byKey.lanaturejur,
    activites: byKey.lactiviteeconomique,
    pays: byKey.lepays,
    pieces: byKey.lestypepiecesId,
    arrondissements: byKey.larrondissement,
    impots: byKey.lecentreimpot,
    centres: byKey.lecentrecnps,
  }
}

/** Dossier télé-immat existant — POST infoemployeurtele.jsp (completeEmpl type 2). */
export async function fetchEmployeurTele(codeTele, codeSecret) {
  assertLegacyEnabled()
  const data = await postLegacyJsp(JSP.infoEmployeurTele, {
    code_tele: codeTele,
    code_secret: codeSecret,
  })
  const row = firstLegacyRow(data)
  if (!row) throw new Error('Enregistrement inexistant.')
  return row
}

/**
 * Recherche siège — toutesentreprises.jsp (completeEmpl type e).
 * @param {string} matricule
 */
export async function fetchSiegeEmployeurByMatricule(matricule) {
  assertLegacyEnabled()
  const normalized = normalizeEmployerMatricule(matricule)
  const mat = ` where E.num_employeur = '${normalized}' and rownum=1 `
  const data = await postLegacyJsp(JSP.toutesEntreprises, { mat })
  const row = firstLegacyRow(data)
  if (!row) {
    throw new Error(`Employeur inconnu pour le matricule « ${normalized} ».`)
  }
  return row
}
