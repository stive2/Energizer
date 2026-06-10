import { isLegacySessionExpiredHtml } from 'src/modules/energizer/api/adapters/parseNouveauDossierLegacyHtml.js'
import { isEnergizerLegacyAuthEnabled } from 'src/modules/shared/config/energizerHttp.js'
import {
  clearPortalSimSession,
  isAgentSessionActive,
} from 'src/modules/shared/utils/portalSimAuthSession.js'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'
import { routeRequiresAgentAuth } from 'src/router/guards/meta.js'
import { notifyNegative } from 'src/modules/shared/utils/appNotify.js'

export const ENERGIZER_SESSION_EXPIRED_MESSAGE =
  'Session Energizer expirée. Veuillez vous reconnecter.'

export const ENERGIZER_SESSION_PROBE_INTERVAL_MS = 5 * 60 * 1000

let routerRef = null
let handlingExpiry = false
let lastSessionProbeAt = 0

/** @param {import('vue-router').Router} router */
export function registerEnergizerSessionRouter(router) {
  routerRef = router
}

/** @param {unknown} error */
export function isEnergizerSessionExpiredError(error) {
  return (
    error?.code === 'SESSION_EXPIRED'
    || error?.message === ENERGIZER_SESSION_EXPIRED_MESSAGE
  )
}

export function createEnergizerSessionExpiredError() {
  const error = new Error(ENERGIZER_SESSION_EXPIRED_MESSAGE)
  error.code = 'SESSION_EXPIRED'
  return error
}

/**
 * @param {{ data?: unknown, html?: string, url?: string, redirectUrl?: string | null, finalUrl?: string | null }} sources
 */
export function isEnergizerSessionExpiredResponse(sources = {}) {
  const { data, html, url, redirectUrl, finalUrl } = sources
  const chunks = [html, url, redirectUrl, finalUrl].filter((value) => typeof value === 'string')

  if (typeof data === 'string') {
    chunks.push(data)
  }

  for (const chunk of chunks) {
    const raw = String(chunk).trim()
    if (!raw) continue
    if (/index\.html/i.test(raw)) {
      return true
    }
    if (isLegacySessionExpiredHtml(raw)) {
      return true
    }
  }

  if (typeof data === 'string' && !String(data).trim()) {
    return true
  }

  return false
}

/**
 * @param {string} [redirectPath]
 */
export async function handleEnergizerSessionExpired(redirectPath) {
  if (!isEnergizerLegacyAuthEnabled()) return
  if (handlingExpiry) return

  handlingExpiry = true

  try {
    clearPortalSimSession()
    try {
      useEnergizerSessionStore().clear()
    } catch {
      /* Pinia pas encore disponible */
    }

    notifyNegative(ENERGIZER_SESSION_EXPIRED_MESSAGE, { timeout: 8000 })

    if (!routerRef) return

    const current = routerRef.currentRoute.value
    if (current.name === 'energizer-login') return

    const query = { reason: 'session_expired' }
    const path = redirectPath || current.fullPath
    if (path && path !== '/' && !path.includes('energizer-login')) {
      query.redirect = path
    }

    await routerRef.replace({ name: 'energizer-login', query })
  } finally {
    window.setTimeout(() => {
      handlingExpiry = false
    }, 1500)
  }
}

/**
 * @param {import('axios').AxiosInstance} axiosInstance
 */
export function setupEnergizerAxiosSessionInterceptor(axiosInstance) {
  if (!isEnergizerLegacyAuthEnabled()) return

  axiosInstance.interceptors.response.use(
    (response) => {
      if (response.config?.skipSessionExpiryCheck) return response

      const finalUrl = String(response.request?.responseURL ?? response.config?.url ?? '')
      if (isEnergizerSessionExpiredResponse({ data: response.data, finalUrl, url: finalUrl })) {
        void handleEnergizerSessionExpired()
        return Promise.reject(createEnergizerSessionExpiredError())
      }
      return response
    },
    (error) => {
      if (error.config?.skipSessionExpiryCheck) return Promise.reject(error)

      const response = error.response
      const finalUrl = String(
        response?.request?.responseURL ?? response?.headers?.location ?? '',
      )
      if (isEnergizerSessionExpiredResponse({
        data: response?.data,
        finalUrl,
        url: finalUrl,
      })) {
        void handleEnergizerSessionExpired()
        return Promise.reject(createEnergizerSessionExpiredError())
      }
      return Promise.reject(error)
    },
  )
}

/**
 * Sonde légère pagePrincipale.jsp (throttle 5 min) sur navigation agent.
 * @param {import('vue-router').RouteLocationNormalized} toRoute
 */
export async function probeEnergizerSessionIfNeeded(toRoute) {
  if (!isEnergizerLegacyAuthEnabled()) return
  if (!isAgentSessionActive()) return
  if (toRoute?.name === 'energizer-login') return

  if (!routeRequiresAgentAuth(toRoute)) return

  const now = Date.now()
  if (now - lastSessionProbeAt < ENERGIZER_SESSION_PROBE_INTERVAL_MS) return
  lastSessionProbeAt = now

  const { refreshEnergizerPagePrincipale } = await import(
    'src/modules/shared/api/auth/energizerAuthApi.js'
  )

  try {
    const { html } = await refreshEnergizerPagePrincipale()
    const { readAgentLogin } = await import(
      'src/modules/energizer/utils/syncAuthUserFromEnergizer.js'
    )
    useEnergizerSessionStore().applyFromHtml(html, readAgentLogin())
  } catch (error) {
    if (isEnergizerSessionExpiredError(error)) {
      await handleEnergizerSessionExpired(toRoute.fullPath)
      throw error
    }
  }
}

/**
 * @param {{ html?: string, redirectUrl?: string | null, finalUrl?: string | null, url?: string, data?: unknown }} payload
 */
export function assertEnergizerLegacySessionActive(payload = {}) {
  if (isEnergizerSessionExpiredResponse(payload)) {
    void handleEnergizerSessionExpired()
    throw createEnergizerSessionExpiredError()
  }
}
