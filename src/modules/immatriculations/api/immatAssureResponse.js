import { parseLegacyNextPage } from 'src/modules/immatriculations/adapters/legacyJsonAdapter.js'

/** Retire les balises HTML pour affichage notification. */
export function stripHtml(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extrait codeTele / codeSecret du message HTML GererAssure.
 * Ex. « Votre code de pré-immatriculation est : TIA…, Votre code secret est : O22728 »
 * @param {string|null|undefined} msg
 * @returns {{ codeTele?: string, codeSecret?: string }}
 */
export function parseCredentialsFromGererAssureMsg(msg) {
  if (!msg || typeof msg !== 'string') return {}
  const plain = msg.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
  const codeTele =
    plain.match(/pr[eé][-. ]?immatriculation est\s*:\s*([A-Za-z0-9-]+)/i)?.[1] ||
    plain.match(/code d['']enregistrement est\s*:\s*([A-Za-z0-9-]+)/i)?.[1]
  const codeSecret = plain.match(/code secret est\s*:\s*([A-Za-z0-9-]+)/i)?.[1]
  return { codeTele, codeSecret }
}

function isGererAssureDuplicate(payload) {
  const exec = payload.exec ?? payload.Exec
  return exec === '1' || exec === 1
}

/**
 * Analyse la réponse POST GererAssure (legacy ExtJS ou API REST CNPS).
 * @param {unknown} data — corps axios (JSON parsé ou texte)
 * @param {string} [rawText]
 */
export function parseImmatAssureSubmitResponse(data, rawText = '') {
  let text = typeof data === 'string' ? data : rawText || ''

  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    // axios a déjà parsé le JSON
  } else if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return parseImmatAssureSubmitResponse(parsed, data)
    } catch {
      text = data
    }
  }

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
    const ok =
      payload.success === true ||
      payload.Success === true ||
      payload.success === 'true' ||
      payload.Success === 'true'
    let message =
      payload.Msg ||
      payload.message ||
      payload.msg ||
      (ok ? 'Enregistrement réussi.' : 'Échec de l’enregistrement.')

    if (!ok && typeof message === 'string' && message.includes('ORA-01722')) {
      message =
        'Échec de l’enregistrement : format numérique invalide (vérifiez téléphone, fax, revenu, effectif). ' +
        stripHtml(message).slice(0, 200)
    }

    if (ok && isGererAssureDuplicate(payload)) {
      return {
        success: false,
        message: stripHtml(String(message)),
        nextPage: payload.nextPage || payload.next_page || null,
        codeTele: null,
        codeSecret: null,
        duplicate: true,
      }
    }

    return {
      success: ok,
      message: String(message),
      nextPage: payload.nextPage || payload.next_page || null,
      codeTele:
        payload.codeTele ||
        payload.code_tele ||
        payload.numAssu ||
        payload.CODE_TELE_ASSU ||
        null,
      codeSecret: payload.codeSecret || payload.code_secret || payload.CODE_SECRET || null,
    }
  }

  if (text) {
    if (text.trimStart().startsWith('<')) {
      return { success: false, message: 'Réponse HTML inattendue du serveur (GererAssure).' }
    }
    return { success: false, message: text.slice(0, 300) }
  }

  return { success: false, message: 'Réponse serveur vide ou non reconnue.' }
}

/**
 * Enrichit le résultat de soumission avec codeTele / codeSecret (nextPage, Msg, corps JSON).
 * @param {ReturnType<typeof parseImmatAssureSubmitResponse>} parsed
 */
export function enrichSubmitCredentials(parsed) {
  if (!parsed) return parsed
  const fromPage = parseLegacyNextPage(parsed.nextPage)
  const fromMsg = parseCredentialsFromGererAssureMsg(parsed.message)
  return {
    ...parsed,
    codeTele: parsed.codeTele || fromPage.codeTele || fromMsg.codeTele || null,
    codeSecret: parsed.codeSecret || fromPage.codeSecret || fromMsg.codeSecret || null,
    message: stripHtml(parsed.message),
  }
}
