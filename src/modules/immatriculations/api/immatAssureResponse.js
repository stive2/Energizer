/**
 * Analyse la réponse POST GererAssure (legacy ExtJS ou API REST CNPS).
 * @param {unknown} data — corps axios (JSON parsé ou texte)
 * @param {string} [rawText]
 */
export function parseImmatAssureSubmitResponse(data, rawText = '') {
  const text = typeof data === 'string' ? data : rawText || ''

  if (text && text.toLowerCase().includes('erreur')) {
    return { success: false, message: text }
  }

  let payload = data
  if (payload != null && typeof payload === 'object') {
    if (Array.isArray(payload.root) && payload.root[0]) {
      payload = payload.root[0]
    } else if (payload.data != null && typeof payload.data === 'object') {
      payload = payload.data
    }
  }

  if (payload != null && typeof payload === 'object') {
    const ok = payload.success === true || payload.Success === true
    const message =
      payload.Msg ||
      payload.message ||
      payload.msg ||
      (ok ? 'Enregistrement réussi.' : 'Échec de l’enregistrement.')
    return {
      success: ok,
      message: String(message),
      nextPage: payload.nextPage || payload.next_page || null,
    }
  }

  if (text) {
    return { success: true, message: text }
  }

  return { success: false, message: 'Réponse serveur vide ou non reconnue.' }
}
