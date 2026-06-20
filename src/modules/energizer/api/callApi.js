/**
 * Exécute un appel API HTTP.
 * @template T
 * @param {() => Promise<T>} requestFn
 * @returns {Promise<T>}
 */
export async function callApi(requestFn) {
  return requestFn()
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
