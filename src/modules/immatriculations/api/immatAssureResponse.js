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

/**
 * Message court après GererAssure (codes uniquement, sans lien legacy).
 * @param {string} [msg]
 * @param {{ codeTele?: string|null, codeSecret?: string|null }} [credentials]
 */
export function formatGererAssureCredentialsMessage(msg, credentials = {}) {
  const fromMsg = parseCredentialsFromGererAssureMsg(msg)
  const codeTele = credentials.codeTele || fromMsg.codeTele
  const codeSecret = credentials.codeSecret || fromMsg.codeSecret
  if (codeTele && codeSecret) {
    return `Votre code de pré-immatriculation est : ${codeTele},\nVotre code secret est : ${codeSecret}`
  }
  const plain = stripHtml(msg)
  if (!plain) return ''
  const cut = plain.split(/CLIQUER SUR LE LIEN/i)[0]?.trim() || plain
  return cut.replace(/\s+/g, ' ').trim()
}

function isGererAssureDuplicate(payload) {
  const exec = payload.exec ?? payload.Exec
  return exec === '1' || exec === 1
}

/** GererAssure renvoie parfois success:true avec un Msg de cohérence (pas d'enregistrement). */
function isGererAssureCoherenceMessage(message) {
  const plain = stripHtml(String(message || ''))
  if (!plain) return false
  return /coh[eé]rence/i.test(plain) || /verifiez que\s*:/i.test(plain)
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
      (ok ? 'Enregistrement réussi.' : '')

    if (!ok && !message) {
      message =
        'Échec de l’enregistrement : le serveur n’a pas fourni de détail (vérifiez les pièces jointes obligatoires).'
    }

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

    if (ok && isGererAssureCoherenceMessage(message)) {
      return {
        success: false,
        message: stripHtml(String(message)),
        nextPage: payload.nextPage || payload.next_page || null,
        codeTele: null,
        codeSecret: null,
        coherence: true,
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
  const codeTele = parsed.codeTele || fromPage.codeTele || fromMsg.codeTele || null
  const codeSecret = parsed.codeSecret || fromPage.codeSecret || fromMsg.codeSecret || null
  const shortMessage = formatGererAssureCredentialsMessage(parsed.message, {
    codeTele,
    codeSecret,
  })
  return {
    ...parsed,
    codeTele,
    codeSecret,
    message: stripHtml(parsed.message),
    shortMessage,
  }
}

/**
 * Message de notification après GererAssure (codes uniquement, jamais le lien legacy).
 * @param {ReturnType<typeof enrichSubmitCredentials>} result
 * @param {string} [fallback]
 */
export function resolveImmatSubmitNotifyMessage(result, fallback = '') {
  if (!result) return fallback
  const short = String(result.shortMessage || '').trim()
  if (short) return short
  const rebuilt = formatGererAssureCredentialsMessage(result.message, {
    codeTele: result.codeTele,
    codeSecret: result.codeSecret,
  })
  if (rebuilt) return rebuilt
  const plain = stripHtml(result.message)
  if (!plain) return fallback
  return plain.split(/CLIQUER SUR LE LIEN/i)[0]?.trim() || plain
}
