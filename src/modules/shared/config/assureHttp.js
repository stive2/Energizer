/**
 * Configuration HTTP — backend PHP Espace assuré (backend-assure).
 *
 * Surcharge via .env :
 * VITE_ASSURE_LEGACY_AUTH, VITE_ASSURE_API_BASE_URL, VITE_ASSURE_API_USE_PROXY
 */

const DEFAULT_ASSURE_API_URL = 'http://172.17.15.121:83'
const DEFAULT_ASSURE_API_PORT = 83

function normalizeBaseUrl(url) {
  if (!url || typeof url !== 'string') return ''
  return url.trim().replace(/\/+$/, '')
}

function envFlagTrue(value) {
  return value === true || value === 'true' || value === '1'
}

export function isAssureLegacyAuthEnabled() {
  return import.meta.env.VITE_ASSURE_LEGACY_AUTH !== 'false'
}

export function getAssureApiDirectBaseUrl() {
  const fromEnv = normalizeBaseUrl(import.meta.env.VITE_ASSURE_API_BASE_URL)
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:${DEFAULT_ASSURE_API_PORT}`
  }
  return DEFAULT_ASSURE_API_URL
}

/** Préfixe proxy Apache / Vite */
export const ASSURE_API_PROXY_PREFIX = '/api-assure'

export function getAssureApiBaseUrl() {
  if (envFlagTrue(import.meta.env.VITE_ASSURE_API_USE_PROXY)) {
    return ASSURE_API_PROXY_PREFIX
  }
  return getAssureApiDirectBaseUrl()
}

export function getAssureApiTimeout() {
  const n = Number(import.meta.env.VITE_ASSURE_API_TIMEOUT)
  return Number.isFinite(n) && n > 0 ? n : 60_000
}
