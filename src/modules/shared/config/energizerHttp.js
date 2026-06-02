/**
 * Configuration HTTP — backend Energizer Tomcat (userloginmid.jsp).
 * Référence : dossier EnergizerDev du dépôt (boussole uniquement).
 *
 * Surcharge via .env :
 * VITE_ENERGIZER_LEGACY_AUTH, VITE_ENERGIZER_BASE_URL, VITE_ENERGIZER_USE_PROXY
 */

const DEFAULT_ENERGIZER_URL = 'http://172.17.15.121:8080/EnergizerDev'

function normalizeBaseUrl(url) {
  if (!url || typeof url !== 'string') return ''
  return url.trim().replace(/\/+$/, '')
}

function envFlagTrue(value) {
  return value === true || value === 'true' || value === '1'
}

function readBaseUrlEnv() {
  return (
    normalizeBaseUrl(import.meta.env.VITE_ENERGIZER_BASE_URL) ||
    normalizeBaseUrl(import.meta.env.VITE_ENERGIZER_DEV_BASE_URL) ||
    DEFAULT_ENERGIZER_URL
  )
}

function readUseProxyEnv() {
  const v =
    import.meta.env.VITE_ENERGIZER_USE_PROXY ?? import.meta.env.VITE_ENERGIZER_DEV_USE_PROXY
  return envFlagTrue(v)
}

/** Authentification agent via userloginmid.jsp (désactiver uniquement si REST /auth prêt). */
export function isEnergizerLegacyAuthEnabled() {
  return import.meta.env.VITE_ENERGIZER_LEGACY_AUTH !== 'false'
}

export function getEnergizerDirectBaseUrl() {
  return readBaseUrlEnv()
}

/** Contexte Tomcat (nom du WAR déployé). */
export const ENERGIZER_TOMCAT_CONTEXT = '/EnergizerDev'

/**
 * URL utilisée par le client axios Energizer (Tomcat).
 * En dev : proxy Vite `/EnergizerDev` → Tomcat (évite conflit avec la route Vue `/energizer`).
 */
export function getEnergizerBaseUrl() {
  if (readUseProxyEnv()) {
    return ENERGIZER_TOMCAT_CONTEXT
  }
  return getEnergizerDirectBaseUrl()
}

export function getEnergizerTimeout() {
  const n = Number(
    import.meta.env.VITE_ENERGIZER_TIMEOUT ?? import.meta.env.VITE_ENERGIZER_DEV_TIMEOUT,
  )
  return Number.isFinite(n) && n > 0 ? n : 60_000
}
