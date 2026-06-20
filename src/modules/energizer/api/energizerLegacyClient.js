import { energizerAxios } from 'src/modules/shared/api/auth/energizerClient.js'
import { getEnergizerBaseUrl } from 'src/modules/shared/config/energizerHttp.js'
import { parseLegacyRoot } from 'src/modules/immatriculations/adapters/legacyJsonAdapter.js'
import { parseLegacyRedirectError } from './adapters/parseNouveauDossierLegacyHtml.js'
import {
  assertEnergizerLegacySessionActive,
  isEnergizerSessionExpiredResponse,
} from '../utils/energizerSessionExpiry.js'

/** JSP / servlets EnergizerDev — équivalent ExtJS register.js */
export const ENERGIZER_LEGACY_JSP = {
  nouvDossier: 'nouvDossier.jsp',
  naturePrestation: 'naturePrestation.jsp',
  typeCircuit: 'typecircuit.jsp',
  infoAssure: 'infoAssure.jsp',
  infoEmployeur: 'infoemployeur.jsp',
  teleimportation: 'teleimportation.jsp',
  nouvdossierServlet: 'nouvdossier',
  showPieces: 'show.jsp',
  showAjoutPieces: 'showAjout.jsp',
  endDossier: 'end.jsp',
  endRecepDossier: 'endRecep.jsp',
  jAccueil: 'jAccueil.jsp',
  getDossier: 'get/get_dossier.jsp',
  addpieceRecep: 'addpieceRecep.jsp',
  pagePrincipale: 'pagePrincipale.jsp',
  elementsLiquidationPF: 'elementsLiquidationPF.jsp',
  elementsLiquidationAF: 'elementsLiquidationAF.jsp',
  gestionDesReprises: 'gestionDesReprises.jsp',
  periodeActivite: 'periodeActivite.jsp',
  gestionPieceMaintientDroit: 'gestionPieceMaintientDroit.jsp',
  statSituationsDossiersParBranche: 'statSituationsDossiersParBranche.jsp',
  declaration: 'declaration.jsp',
  nlledeclaration: 'nlledeclaration.jsp',
  arrondissement: 'arrondissement.jsp',
  typeRisque: 'typerisque.jsp',
  siegeLesion: 'siegelesion.jsp',
  natureLesion: 'naturelesion.jsp',
  agentMateriel: 'agentmateriel.jsp',
  posteTravail: 'postetravail.jsp',
  certificatInit: 'certificatinit.jsp',
  newCertificat: 'newcertificat.jsp',
  newCertificatDeces: 'newcertificatdeces.jsp',
  newTiersBeneficiaire: 'newtiersbeneficiaire.jsp',
  tiersBeneficiaires: 'lestiersbeneficiaires.jsp',
  nouvelleNote: 'nouvellenote.jsp',
  natureNoteFrais: 'naturenotefrais.jsp',
  nlleNoteDeFrais: 'nllenotedefrais.jsp',
}

/** Servlets POST application/x-www-form-urlencoded (SaisieElementLiquidationPF, etc.) */
export const ENERGIZER_LEGACY_SERVLETS = {
  eltliquidationpf: 'eltliquidationpf',
  eltliquidationaf: 'eltliquidationaf',
  gestiondesreprises: 'gestiondesreprises',
  delnonreprise: 'delnonreprise',
  gestionperiodeactivite: 'gestionperiodeactivite',
  gestpmd: 'gestpmd',
  declaration: 'declaration',
  certificatinit: 'certificatinit',
  certificatdeces: 'certificatdeces',
  saisietiersbeneficiaire: 'saisietiersbeneficiaire',
  NouvelleNote: 'NouvelleNote',
}

function legacyRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.pagePrincipale}`
}

/** Referer attendu par NouvDossier.java (redirect ?error= vers nouveauDossier.jsp). */
export function legacyNouveauDossierRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/nouveauDossier.jsp`
}

function legacyPostHeaders(contentType = 'application/x-www-form-urlencoded') {
  // Referer est un en-tête protégé du navigateur : il ne peut pas être défini via XHR.
  return { 'Content-Type': contentType }
}

function assertLegacyJsonPayload(data, label) {
  if (data == null) {
    throw new Error(`Réponse vide (${label}).`)
  }

  if (typeof data === 'string') {
    const trimmed = data.trim()
    if (!trimmed) {
      throw new Error(`Réponse vide (${label}).`)
    }
    if (isEnergizerSessionExpiredResponse({ data: trimmed })) {
      assertEnergizerLegacySessionActive({ data: trimmed })
    }
    throw new Error(data.message || `Erreur serveur (${label}).`)
  }
}

function guardLegacyServletPayload(payload) {
  assertEnergizerLegacySessionActive(payload)
  return payload
}

/**
 * GET JSP legacy (cache-bust `_dc` comme ExtJS).
 * @param {string} path
 * @param {Record<string, string|number>} [params]
 */
export async function getEnergizerLegacyJsp(path, params = {}) {
  const { data } = await energizerAxios.get(path, {
    params: { _dc: Date.now(), ...params },
    skipErrorNotify: true,
  })
  return data
}

/**
 * POST application/x-www-form-urlencoded vers JSP / servlet legacy.
 * @param {string} path
 * @param {Record<string, string|number>} [params]
 */
export async function postEnergizerLegacyJsp(path, params = {}) {
  const body = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') body.append(key, String(value))
  })
  const { data } = await energizerAxios.post(path, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    skipErrorNotify: true,
  })
  return data
}

/**
 * POST legacy — réponse HTML ou redirect (nouvdossier, show.jsp, end.jsp).
 * @param {string} path
 * @param {Record<string, string | number | null | undefined>} params
 * @param {{ referer?: string }} [options]
 * @returns {Promise<{ html: string, redirectUrl: string | null, finalUrl: string | null, error: string | null }>}
 */
/**
 * POST legacy — inclut les champs vides (servlets Java lisent getParameter().replaceAll).
 * @param {string} path
 * @param {Record<string, string | number | null | undefined>} params
 * @param {{ referer?: string }} [options]
 */
export async function postEnergizerLegacyServlet(path, params = {}, options = {}) {
  const body = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    body.append(key, value == null ? '' : String(value))
  })

  const referer = options.referer ?? legacyRefererUrl()
  void referer

  const resolveRedirectPayload = (response) => {
    const location = String(response.headers?.location ?? '')
    const finalUrl = String(response.request?.responseURL ?? location)
    const redirectUrl = location || finalUrl || null
    const error =
      parseLegacyRedirectError(location) || parseLegacyRedirectError(finalUrl) || null
    return {
      html: String(response.data ?? ''),
      redirectUrl,
      finalUrl: finalUrl || null,
      error,
    }
  }

  try {
    const response = await energizerAxios.post(path, body, {
      headers: legacyPostHeaders(),
      responseType: 'text',
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      skipErrorNotify: true,
    })

    if (response.status >= 300 && response.status < 400) {
      return guardLegacyServletPayload(resolveRedirectPayload(response))
    }

    const finalUrl = String(response.request?.responseURL ?? '')
    return guardLegacyServletPayload({
      html: String(response.data ?? ''),
      redirectUrl: null,
      finalUrl: finalUrl || null,
      error: parseLegacyRedirectError(finalUrl) || null,
    })
  } catch (error) {
    const response = error?.response
    if (response?.status >= 300 && response.status < 400) {
      return guardLegacyServletPayload(resolveRedirectPayload(response))
    }
    if (isEnergizerSessionExpiredResponse({
      data: response?.data,
      finalUrl: response?.request?.responseURL,
      redirectUrl: String(response?.headers?.location ?? ''),
    })) {
      assertEnergizerLegacySessionActive({
        data: response?.data,
        finalUrl: response?.request?.responseURL,
        redirectUrl: String(response?.headers?.location ?? ''),
      })
    }
    const serverHint = String(response?.data ?? '').trim().slice(0, 240)
    if (response?.status >= 500 && serverHint) {
      throw new Error(serverHint)
    }
    throw error
  }
}

export async function postEnergizerLegacyHtml(path, params = {}, options = {}) {
  const body = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') body.append(key, String(value))
  })

  const referer = options.referer ?? legacyRefererUrl()
  void referer

  const resolveRedirectPayload = (response) => {
    const location = String(response.headers?.location ?? '')
    const finalUrl = String(response.request?.responseURL ?? location)
    const redirectUrl = location || finalUrl || null
    const error =
      parseLegacyRedirectError(location) || parseLegacyRedirectError(finalUrl) || null
    return {
      html: String(response.data ?? ''),
      redirectUrl,
      finalUrl: finalUrl || null,
      error,
    }
  }

  try {
    const response = await energizerAxios.post(path, body, {
      headers: legacyPostHeaders(),
      responseType: 'text',
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      skipErrorNotify: true,
    })

    if (response.status >= 300 && response.status < 400) {
      return guardLegacyServletPayload(resolveRedirectPayload(response))
    }

    const finalUrl = String(response.request?.responseURL ?? '')
    return guardLegacyServletPayload({
      html: String(response.data ?? ''),
      redirectUrl: null,
      finalUrl: finalUrl || null,
      error: parseLegacyRedirectError(finalUrl) || null,
    })
  } catch (error) {
    const response = error?.response
    if (response?.status >= 300 && response.status < 400) {
      return guardLegacyServletPayload(resolveRedirectPayload(response))
    }
    if (isEnergizerSessionExpiredResponse({
      data: response?.data,
      finalUrl: response?.request?.responseURL,
      redirectUrl: String(response?.headers?.location ?? ''),
    })) {
      assertEnergizerLegacySessionActive({
        data: response?.data,
        finalUrl: response?.request?.responseURL,
        redirectUrl: String(response?.headers?.location ?? ''),
      })
    }
    const serverHint = String(response?.data ?? '').trim().slice(0, 240)
    if (response?.status >= 500 && serverHint) {
      throw new Error(serverHint)
    }
    throw error
  }
}

/**
 * GET legacy — réponse HTML (addpieceRecep.jsp).
 * @param {string} path
 * @param {Record<string, string | number>} [params]
 */
export async function getEnergizerLegacyHtml(path, params = {}) {
  try {
    const response = await energizerAxios.get(path, {
      params: { _dc: Date.now(), ...params },
      responseType: 'text',
      validateStatus: (status) => status >= 200 && status < 400,
      skipErrorNotify: true,
    })

    if (response.status >= 300 && response.status < 400) {
      const location = String(response.headers?.location ?? '')
      assertEnergizerLegacySessionActive({
        redirectUrl: location,
        finalUrl: String(response.request?.responseURL ?? location),
      })
      throw new Error(`Réponse inattendue du serveur (${path}).`)
    }

    const html = String(response.data ?? '')
    assertEnergizerLegacySessionActive({ html })
    return html
  } catch (error) {
    const response = error?.response
    if (response?.status >= 300 && response.status < 400) {
      assertEnergizerLegacySessionActive({
        redirectUrl: String(response.headers?.location ?? ''),
        finalUrl: String(response.request?.responseURL ?? ''),
      })
    }
    const serverHint = String(response?.data ?? '').trim().slice(0, 240)
    if (response?.status >= 500 && serverHint) {
      throw new Error(serverHint)
    }
    throw error
  }
}

/**
 * @param {unknown} data
 * @param {string} label
 * @returns {Record<string, unknown>[]}
 */
export function parseEnergizerLegacyRows(data, label) {
  assertLegacyJsonPayload(data, label)
  const rows = parseLegacyRoot(data)
  if (!Array.isArray(rows)) {
    throw new Error(`Format de réponse inattendu (${label}).`)
  }
  return rows
}
