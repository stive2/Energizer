/**
 * Exécute un appel API ; en secours optionnel (VITE_CNPS_API_FALLBACK_MOCK) exécute le mock.
 * @template T
 * @param {() => Promise<T>} requestFn
 * @param {() => Promise<T>|T} [fallbackFn]
 * @returns {Promise<T>}
 */
export async function callApi(requestFn, fallbackFn) {
  const useFallback = import.meta.env.VITE_CNPS_API_FALLBACK_MOCK === 'true'

  if (!useFallback) {
    return requestFn()
  }

  try {
    return await requestFn()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[CNPS API] fallback mock:', error?.message || error)
    }
    if (fallbackFn) {
      return await fallbackFn()
    }
    throw error
  }
}

/**
 * Extrait le corps utile d'une réponse API (axios `data` ou enveloppe `{ data: … }`).
 * @param {unknown} payload
 */
export function unwrapData(payload) {
  if (payload != null && typeof payload === 'object' && !Array.isArray(payload) && 'data' in payload) {
    return payload.data
  }
  return payload
}
