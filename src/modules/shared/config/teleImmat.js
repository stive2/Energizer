/**
 * Configuration HTTP — teleImmat_0.1 (Tomcat legacy)
 * Surcharge via .env : VITE_TELE_IMMAT_USE_LEGACY, VITE_TELE_IMMAT_BASE_URL, VITE_TELE_IMMAT_DIRECT_URL
 */

const DEFAULT_TELE_IMMAT_DIRECT_URL = 'http://172.17.15.121:8080/teleImmat_0.1'
const DEFAULT_TIMEOUT_MS = 120_000

function normalizeBaseUrl(url) {
  if (!url || typeof url !== 'string') return ''
  return url.trim().replace(/\/+$/, '')
}

function envFlagTrue(value) {
  return value === true || value === 'true' || value === '1'
}

/** Active les appels directs vers teleImmat_0.1 (JSP + GererAssure). */
export function isTeleImmatLegacyEnabled() {
  return envFlagTrue(import.meta.env.VITE_TELE_IMMAT_USE_LEGACY)
}

export function getTeleImmatDirectBaseUrl() {
  return (
    normalizeBaseUrl(import.meta.env.VITE_TELE_IMMAT_DIRECT_URL) ||
    DEFAULT_TELE_IMMAT_DIRECT_URL
  )
}

/**
 * URL utilisée par le client axios teleImmat.
 * En dev : proxy Vite `/tele-immat` → Tomcat.
 */
export function getTeleImmatBaseUrl() {
  if (envFlagTrue(import.meta.env.VITE_TELE_IMMAT_USE_PROXY)) {
    return '/tele-immat'
  }
  const custom = normalizeBaseUrl(import.meta.env.VITE_TELE_IMMAT_BASE_URL)
  if (custom) return custom
  if (isTeleImmatLegacyEnabled()) {
    return getTeleImmatDirectBaseUrl()
  }
  return '/tele-immat'
}

export function getTeleImmatTimeout() {
  const n = Number(import.meta.env.VITE_TELE_IMMAT_TIMEOUT)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS
}

/** Chemin de dépôt des pièces — aligné traitementFm1.js DestFichAssu */
export const TELE_IMMAT_DEST_ASSURE = 'dossiers/assure/immas/'
