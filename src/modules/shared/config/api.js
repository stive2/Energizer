/**
 * Configuration HTTP — API CNPS Energizer
 * Surcharge via .env : VITE_CNPS_API_BASE_URL, VITE_CNPS_API_TIMEOUT, VITE_CNPS_API_USE_PROXY
 */

const DEFAULT_CNPS_API_BASE_URL = 'http://172.17.15.121:8020'
const DEFAULT_TIMEOUT_MS = 30_000

/** Clé localStorage du jeton (alignée espace assuré / futures routes API) */
export const CNPS_AUTH_TOKEN_KEY = 'auth_token'

function normalizeBaseUrl(url) {
  if (!url || typeof url !== 'string') return ''
  return url.trim().replace(/\/+$/, '')
}

function envFlagTrue(value) {
  return value === true || value === 'true' || value === '1'
}

/** URL directe du serveur CNPS (sans slash final) */
export function getCnpsApiDirectBaseUrl() {
  return (
    normalizeBaseUrl(import.meta.env.VITE_CNPS_API_BASE_URL) ||
    DEFAULT_CNPS_API_BASE_URL
  )
}

/**
 * URL utilisée par axios.
 * En dev, VITE_CNPS_API_USE_PROXY=true route via le proxy Vite (/api-cnps) pour éviter CORS.
 */
export function getCnpsApiBaseUrl() {
  if (envFlagTrue(import.meta.env.VITE_CNPS_API_USE_PROXY)) {
    return '/api-cnps'
  }
  return getCnpsApiDirectBaseUrl()
}

export function getCnpsApiTimeout() {
  const n = Number(import.meta.env.VITE_CNPS_API_TIMEOUT)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS
}
