/**
 * Dépôt prestations familiales — communication directe teleImmat_0.1 (Tomcat).
 * Même principe que le module immatriculation : PHP réservé à l'authentification assuré.
 *
 * JSP / servlets utilisés (alignés tele_prestation_pf.js) :
 * - POST /immat/infoassure.jsp       → contexte assuré
 * - POST /immat/toutesentreprises.jsp → recherche employeur
 * - POST /Choix_prestation_pf        → enregistrement dossier + pièces
 */
import { firstLegacyRow } from 'src/modules/immatriculations/adapters/legacyJsonAdapter.js'
import { fetchEmployerByMatricule } from 'src/modules/immatriculations/api/teleImmatAssureApi.js'
import { postLegacyJsp, teleImmatAxios } from 'src/modules/immatriculations/api/teleImmatClient.js'
import { isTeleImmatLegacyEnabled } from 'src/modules/shared/config/teleImmat.js'
import {
  assertPfRequiredScalars,
  buildPfFilesOnlyFormData,
  buildPfServletSubmitUrl,
  splitPfFormData,
} from 'src/modules/assure/utils/pfServletSubmit.js'
import {
  escapeLegacySqlLiteral,
  getDepotPfNumAssuFromSession,
  mapEmployeurApiRow,
  mapInfoAssureRowToDepotPfContexte,
  normalizeMatriculeEmployeur,
} from './depotPrestationPfUtils.js'

const JSP = {
  infoAssure: '/immat/infoassure.jsp',
}

const PF_SERVLET_SUBMIT_PATH = '/Choix_prestation_pf'
const PF_SUBMIT_TIMEOUT_MS = 300_000

function assertTeleImmatLegacy() {
  if (!isTeleImmatLegacyEnabled()) {
    throw new Error(
      'Dépôt prestations familiales indisponible : définissez VITE_TELE_IMMAT_USE_LEGACY=true.',
    )
  }
}

function unwrapServletPfPayload(payload) {
  let body = payload
  if (typeof payload === 'string') {
    try {
      body = JSON.parse(payload)
    } catch {
      throw new Error('Réponse servlet PF invalide.')
    }
  }
  const row = body?.root?.[0] ?? body?.[0] ?? body
  if (!row || typeof row !== 'object') {
    throw new Error('Réponse servlet PF sans données.')
  }
  const success = row.success === true || row.Success === true
  const msg = row.Msg || row.msg || ''
  if (!success) {
    throw new Error(cleanServletErrorMessage(msg) || 'Échec du dépôt du dossier.')
  }
  const out = { success: true, Msg: msg }
  if (row.nextPage) out.nextPage = row.nextPage
  return out
}

function cleanServletErrorMessage(msg) {
  const cleaned = String(msg || '')
    .replace(/^Erreur sur operation/i, '')
    .trim()
  if (/NullPointerException/i.test(cleaned)) {
    return 'Erreur technique lors du dépôt. Vérifiez que tous les champs obligatoires et pièces jointes sont renseignés.'
  }
  return cleaned
}

function normalizePfSubmitError(error) {
  const data = error?.response?.data
  if (data) {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        const row = parsed?.root?.[0] ?? parsed?.[0] ?? parsed
        const msg = row?.Msg || row?.msg || parsed?.message
        if (msg) return new Error(cleanServletErrorMessage(msg))
      } catch {
        if (data.trim()) return new Error(cleanServletErrorMessage(data.trim()))
      }
    } else if (typeof data === 'object') {
      const row = data?.root?.[0] ?? data?.[0] ?? data
      const msg = row?.Msg || row?.msg || data?.message
      if (msg) return new Error(cleanServletErrorMessage(msg))
    }
  }
  if (error?.message) return error
  return new Error('Impossible d’envoyer le dossier prestations familiales.')
}

function resolveNumAssu(numAssu) {
  const mat = String(numAssu || getDepotPfNumAssuFromSession() || '').trim()
  if (!mat) {
    throw new Error('Matricule assuré requis.')
  }
  return mat
}

/**
 * Contexte assuré — équivalent completeInfo('../immat/infoassure.jsp', '1') dans tele_prestation_pf.js.
 * @param {string} [numAssu]
 */
export async function loadAssureDepotPfContexte(numAssu) {
  assertTeleImmatLegacy()
  const mat = resolveNumAssu(numAssu)
  const cond = ` where a.num_assu = '${escapeLegacySqlLiteral(mat)}' `

  const data = await postLegacyJsp(JSP.infoAssure, { cond })
  const row = firstLegacyRow(data)
  if (!row) {
    throw new Error('Assuré introuvable.')
  }

  const mapped = mapInfoAssureRowToDepotPfContexte(row, mat)
  if (!mapped) {
    throw new Error('Contexte assuré invalide.')
  }
  return mapped
}

/**
 * Recherche employeur — équivalent completeInfo('../immat/toutesentreprises.jsp', 'e').
 */
export async function fetchEmployeurDepotPf(matricule) {
  assertTeleImmatLegacy()
  const mat = normalizeMatriculeEmployeur(matricule)
  if (!mat) {
    throw new Error('Matricule employeur requis.')
  }

  const rows = await fetchEmployerByMatricule(mat)
  const mapped = mapEmployeurApiRow(rows[0])
  if (!mapped) {
    throw new Error('Employeur non trouvé')
  }
  return mapped
}

/**
 * Lecture dossier PF — infodossiertele.jsp (legacy).
 * @param {{ codeTele: string, codeSecret?: string }} params
 */
export async function loadDossierPfTele({ codeTele, codeSecret }) {
  assertTeleImmatLegacy()
  const code = String(codeTele || '').trim()
  if (!code) {
    throw new Error('Code télé dossier requis.')
  }
  const params = { code_tele: code }
  const secret = String(codeSecret || '').trim()
  if (secret) params.code_secret = secret

  const data = await postLegacyJsp('/prest/infodossiertele.jsp', params)
  const row = firstLegacyRow(data)
  if (!row) {
    throw new Error('Dossier prestations familiales introuvable.')
  }
  return row
}

/**
 * Soumission Choix_prestation_pf — contournement Tomcat identique à PfServletProxy :
 * scalaires en query-string, fichiers seuls en multipart (teleImmat inchangé).
 * @param {FormData} formData
 */
export async function submitDepotPrestationPf(formData) {
  assertTeleImmatLegacy()

  const { scalars, files } = splitPfFormData(formData)
  if (!files.length) {
    throw new Error('Aucune pièce jointe pour le dépôt prestations familiales.')
  }

  const normalized = assertPfRequiredScalars(scalars)
  const url = buildPfServletSubmitUrl(PF_SERVLET_SUBMIT_PATH, normalized)
  const fileBody = buildPfFilesOnlyFormData(files)

  if (import.meta.env.DEV) {
    console.info('[PF submit] query scalars OK, files:', files.map(([key]) => key))
  }

  try {
    const { data } = await teleImmatAxios.post(url, fileBody, {
      timeout: PF_SUBMIT_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
      skipErrorNotify: true,
    })
    return unwrapServletPfPayload(data)
  } catch (error) {
    throw normalizePfSubmitError(error)
  }
}
