/**
 * Extrait un message lisible depuis une erreur axios / API CNPS.
 * @param {import('axios').AxiosError} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (!error) return 'Erreur réseau inconnue'

  if (error.code === 'ECONNABORTED') {
    return 'Délai dépassé : le serveur CNPS ne répond pas.'
  }

  if (error.message === 'Network Error' || !error.response) {
    return 'Impossible de joindre l’API CNPS. Vérifiez le réseau et l’adresse du serveur.'
  }

  const { status, data } = error.response
  const body = data && typeof data === 'object' ? data : {}

  if (typeof body.message === 'string' && body.message) return body.message
  if (typeof body.error === 'string' && body.error) return body.error
  if (typeof body.detail === 'string' && body.detail) return body.detail

  if (status === 401) return 'Session expirée ou non autorisée.'
  if (status === 403) return 'Accès refusé.'
  if (status === 404) return 'Ressource introuvable sur l’API CNPS.'
  if (status >= 500) return 'Erreur serveur CNPS. Réessayez plus tard.'

  return `Erreur API (${status})`
}
