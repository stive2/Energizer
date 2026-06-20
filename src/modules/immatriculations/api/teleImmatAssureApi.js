import {
  firstLegacyRow,
  parseLegacyRoot,
} from 'src/modules/immatriculations/adapters/legacyJsonAdapter.js'
import {
  hasTeleImmaAssureSessionData,
  parseTeleImmaAssureSessionFromHtml,
} from 'src/modules/immatriculations/adapters/teleImmaAssureHtmlParser.js'
import { getLegacyJsp, postLegacyJsp, teleImmatAxios } from './teleImmatClient.js'
import {
  getTeleImmatBaseUrl,
  isTeleImmatLegacyEnabled,
} from 'src/modules/shared/config/teleImmat.js'

const JSP = {
  teleImmaAssure: '/immat/tele_imma_assure.jsp',
  toutesEntreprises: '/immat/toutesentreprises.jsp',
  infoAssureTele: '/immat/infoassuretele.jsp',
  larrondissement: '/immat/larrondissement.jsp',
  lepays: '/immat/lepays.jsp',
  lestypepiecesId: '/immat/lestypepiecesId.jsp',
  lasitumatri: '/immat/lasitumatri.jsp',
  lecentrecnps: '/immat/lecentrecnps.jsp',
  loriginerev: '/immat/loriginerev.jsp',
  lesSmig: '/immat/lesSmig.jsp',
}

const REFERENTIAL_LABELS = {
  lasitumatri: 'État matrimonial',
  larrondissement: 'Arrondissements',
  lepays: 'Nationalités',
  lestypepiecesId: "Types de pièce d'identité",
  lecentrecnps: 'Centres CNPS',
  loriginerev: 'Origine des revenus',
  lesSmig: 'Barème SMIG',
}

/** Filtre les origines de revenu pour un régime (1 = volontaire, 0 = obligatoire). */
export function filterOrigineRevenuByRegime(rows, regime = '1') {
  if (!rows?.length) return []
  const code = String(regime)
  const filtered = rows.filter((row) => String(row.CODE_REGIME ?? '') === code)
  return filtered.length ? filtered : rows
}

function assertLegacyEnabled() {
  if (!isTeleImmatLegacyEnabled()) {
    throw new Error(
      'Télé-immatriculation indisponible : définissez VITE_TELE_IMMAT_USE_LEGACY=true.',
    )
  }
}

function normalizeEmployerMatricule(matricule) {
  return String(matricule || '')
    .trim()
    .toUpperCase()
}

/**
 * Paramètres session (DATE_DEMANDE, taux, smig_annuel, …) — lus depuis tele_imma_assure.jsp.
 * teleImmat_0.1 n'expose pas sessionAssureInit.jsp : les champs sont dans #formAssu (legacy ExtJS).
 * @param {{ regime?: string, codeTele?: string, codeSecret?: string }} [options]
 */
export async function fetchSessionAssureInit(options = {}) {
  assertLegacyEnabled()
  const regime = String(options.regime ?? '1')
  const params = { regime, _dc: Date.now() }
  const codeTele = String(options.codeTele || '').trim()
  const codeSecret = String(options.codeSecret || '').trim()
  if (codeTele) params.codeTele = codeTele
  if (codeSecret) params.codeSecret = codeSecret

  const { data: html } = await teleImmatAxios.get(JSP.teleImmaAssure, {
    params,
    responseType: 'text',
    transformResponse: [(payload) => payload],
    headers: { Accept: 'text/html, */*' },
    skipErrorNotify: true,
  })

  const row = parseTeleImmaAssureSessionFromHtml(html)
  if (!hasTeleImmaAssureSessionData(row)) {
    throw new Error(
      'Paramètres télé-immat indisponibles (tele_imma_assure.jsp : date_demande, taux, …).',
    )
  }
  return row
}

/**
 * Recherche employeur — équivalent completeEmpl('toutesentreprises.jsp', 'e').
 * @param {string} matricule
 * @returns {Promise<Record<string, string>[]>}
 */
export async function fetchEmployerByMatricule(matricule) {
  assertLegacyEnabled()
  const normalized = normalizeEmployerMatricule(matricule)
  const mat = ` where E.num_employeur = '${normalized}' `
  const data = await postLegacyJsp(JSP.toutesEntreprises, { mat })
  const rows = parseLegacyRoot(data)
  if (!rows.length) {
    throw new Error(`Employeur inconnu pour le matricule « ${normalized} ».`)
  }
  return rows
}

/** Charge un dossier existant (modification / validation). */
export async function fetchAssureTele(codeTele, codeSecret) {
  assertLegacyEnabled()
  const data = await postLegacyJsp(JSP.infoAssureTele, {
    code_tele: codeTele,
    code_secret: codeSecret,
  })
  const row = firstLegacyRow(data)
  if (!row) throw new Error('Enregistrement inexistant.')
  return row
}

/**
 * URL de la fiche de pré-immatriculation — etat_controle_assure.jsp (teleImmat_0.1).
 * Paramètres alignés sur le JSP serveur : numAssu, codeSecret (optionnel).
 * @param {string} codeTele
 * @param {string} [codeSecret]
 * @returns {string}
 */
export function buildEtatControleAssureUrl(codeTele, codeSecret) {
  assertLegacyEnabled()
  const numAssu = String(codeTele || '').trim()
  if (!numAssu) {
    throw new Error('Code de pré-immatriculation requis pour l’état de contrôle.')
  }
  const params = new URLSearchParams({ numAssu })
  const secret = String(codeSecret || '').trim()
  if (secret) params.set('codeSecret', secret)
  const base = getTeleImmatBaseUrl().replace(/\/+$/, '')
  return `${base}/immat/etat_controle_assure.jsp?${params}`
}

/** Une liste déroulante legacy (GET JSP → `{ root: [...] }`). */
export async function fetchReferentialJsp(key) {
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
 * Référentiels assuré obligatoire — équivalent stores ExtJS imma_assure.js.
 * @returns {Promise<{
 *   matrimonial: Record<string, string>[],
 *   arrondissements: Record<string, string>[],
 *   pays: Record<string, string>[],
 *   pieces: Record<string, string>[],
 *   centres: Record<string, string>[],
 * }>}
 */
export async function fetchImmatAssuReferentials() {
  assertLegacyEnabled()

  const keys = [
    'lasitumatri',
    'larrondissement',
    'lepays',
    'lestypepiecesId',
    'lecentrecnps',
  ]

  const results = await Promise.all(
    keys.map(async (key) => {
      const rows = await fetchReferentialJsp(key)
      if (!rows.length) {
        const label = REFERENTIAL_LABELS[key] || key
        throw new Error(`${label} : réponse vide (${JSP[key]}).`)
      }
      return [key, rows]
    }),
  )

  const byKey = Object.fromEntries(results)
  return {
    matrimonial: byKey.lasitumatri,
    arrondissements: byKey.larrondissement,
    pays: byKey.lepays,
    pieces: byKey.lestypepiecesId,
    centres: byKey.lecentrecnps,
  }
}

/**
 * Référentiels assuré volontaire (régime 1) — lists communes + loriginerev.jsp.
 * @param {string} [regime='1']
 */
/**
 * Lignes SMIG — équivalent POST lesSmig.jsp (regime = CODE_REGIME de l’origine de revenu).
 * @param {string} codeRegime
 * @param {string} [debut] date min (défaut serveur 25/07/2014)
 */
export async function fetchSmigLinesByRegime(codeRegime, debut) {
  assertLegacyEnabled()
  const regime = String(codeRegime || '').trim()
  if (!regime) return []
  const params = { regime }
  const d = String(debut || '').trim()
  if (d) params.debut = d
  const data = await postLegacyJsp(JSP.lesSmig, params)
  return parseLegacyRoot(data)
}

export async function fetchImmatAssuVolReferentials(regime = '1') {
  assertLegacyEnabled()

  const [base, origineRows] = await Promise.all([
    fetchImmatAssuReferentials(),
    fetchReferentialJsp('loriginerev'),
  ])

  if (!origineRows.length) {
    throw new Error(`${REFERENTIAL_LABELS.loriginerev} : réponse vide (${JSP.loriginerev}).`)
  }

  const origineRevenu = filterOrigineRevenuByRegime(origineRows, regime)
  if (!origineRevenu.length) {
    throw new Error(
      `${REFERENTIAL_LABELS.loriginerev} : aucune entrée pour le régime ${regime}.`,
    )
  }

  return {
    ...base,
    origineRevenu,
  }
}

export { teleImmatAxios }
