import { energizerAxios } from 'src/modules/shared/api/auth/energizerClient.js'
import { getEnergizerBaseUrl } from 'src/modules/shared/config/energizerHttp.js'
import { parseLegacyRoot } from 'src/modules/immatriculations/adapters/legacyJsonAdapter.js'
import { parseLegacyRedirectError } from './adapters/parseNouveauDossierLegacyHtml.js'

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
  endDossier: 'end.jsp',
  jAccueil: 'jAccueil.jsp',
  getDossier: 'get/get_dossier.jsp',
  addpieceRecep: 'addpieceRecep.jsp',
  pagePrincipale: 'pagePrincipale.jsp',
}

function legacyRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.pagePrincipale}`
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
    if (trimmed.startsWith('<') || /index\.html/i.test(trimmed)) {
      throw new Error('Session Energizer expirée. Veuillez vous reconnecter.')
    }
  }

  if (typeof data === 'object' && !Array.isArray(data) && data.error) {
    throw new Error(data.message || `Erreur serveur (${label}).`)
  }
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
 * @returns {Promise<{ html: string, redirectUrl: string | null, error: string | null }>}
 */
export async function postEnergizerLegacyHtml(path, params = {}) {
  const body = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') body.append(key, String(value))
  })

  try {
    const response = await energizerAxios.post(path, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: legacyRefererUrl(),
      },
      responseType: 'text',
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      skipErrorNotify: true,
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers?.location ?? ''
      return {
        html: '',
        redirectUrl: location,
        error: parseLegacyRedirectError(location),
      }
    }

    return {
      html: String(response.data ?? ''),
      redirectUrl: null,
      error: null,
    }
  } catch (error) {
    const response = error?.response
    if (response?.status >= 300 && response.status < 400) {
      const location = response.headers?.location ?? ''
      return {
        html: '',
        redirectUrl: location,
        error: parseLegacyRedirectError(location),
      }
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
  const { data } = await energizerAxios.get(path, {
    params: { _dc: Date.now(), ...params },
    responseType: 'text',
    headers: { Referer: legacyRefererUrl() },
    skipErrorNotify: true,
  })
  return String(data ?? '')
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
