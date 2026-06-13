/**
 * Parse les réponses HTML EnergizerDev (addpiece.jsp, addpieceRecep.jsp, redirects).
 */

import { isEnergizerLegacyLoginPageHtml } from 'src/modules/energizer/utils/energizerLegacySessionDetect.js'

/**
 * @param {string} value
 * @returns {string}
 */
/**
 * Tomcat envoie souvent ?error= en ISO-8859-1 sans encodage URL → « » dans le navigateur.
 * @param {string} text
 * @returns {string}
 */
function fixLegacyFrenchEncoding(text) {
  const raw = String(text ?? '')
  if (!raw) return ''
  const needsLatin1Decode =
    /[\uFFFD]/.test(raw) ||
    /Ã.|ï¿½/.test(raw) ||
    /ý|postýrieure|ýtre|\sý\s+la/i.test(raw)
  if (!needsLatin1Decode) return raw
  try {
    const bytes = Uint8Array.from([...raw], (ch) => ch.charCodeAt(0) & 0xff)
    return new TextDecoder('iso-8859-1').decode(bytes)
  } catch {
    try {
      return decodeURIComponent(escape(raw))
    } catch {
      return raw
    }
  }
}

/**
 * Corrections courantes (Tomcat / redirect ?error= en ISO-8859-1 mal interprété).
 * @param {string} text
 * @returns {string}
 */
function fixLegacyFrenchMojibake(text) {
  return String(text ?? '')
    .replace(/ýtre/gi, 'être')
    .replace(/postýrieure/gi, 'postérieure')
    .replace(/\sý\s+la\b/gi, ' à la')
    .replace(/\bd\s+embauche\b/gi, "d'embauche")
    .replace(/\bl\s+insertion\b/gi, "l'insertion")
    .replace(/\bEchec\b/g, 'Échec')
}

/** Messages serveur connus (texte lisible si l’encodage de la redirect échoue). */
const KNOWN_LEGACY_ERROR_MESSAGES = [
  {
    test: (t) => /remboursement.+employeur.+non\s*reprise/i.test(t),
    message:
      'La période de remboursement à cet employeur doit être comprise dans la période à payer par la non-reprise.',
  },
  {
    test: (t) => /num[eé]ro employeur.+referentiel/i.test(t),
    message: "Le numéro employeur saisi ne figure pas dans notre référentiel.",
  },
  {
    test: (t) => /certificat de reprise.+non reprise/i.test(t),
    message:
      'Un certificat de reprise a déjà été saisi pour ce dossier : aucune non-reprise ne peut être émise.',
  },
  {
    test: (t) => /certificat couvre.+chevauchement/i.test(t),
    message: 'Un autre certificat couvre déjà cette période : il ne peut pas y avoir de chevauchement.',
  },
  {
    test: (t) =>
      /date.*embauche.*(?:post|signat|employeur)/i.test(t) ||
      /embauche.*(?:post|signat).*(?:employeur|empl)/i.test(t),
    message:
      "La date d'embauche saisie doit être postérieure à la date de signature de l'employeur.",
  },
]

/**
 * @param {string} text
 * @returns {string}
 */
function polishLegacyFrenchMessage(text) {
  let out = fixLegacyFrenchEncoding(String(text ?? '').trim())
  out = decodeLegacyHtmlEntities(out)
  out = fixLegacyFrenchMojibake(out)
  const known = KNOWN_LEGACY_ERROR_MESSAGES.find((entry) => entry.test(out))
  if (known) return known.message
  return out
    .replace(/\betre\b/gi, 'être')
    .replace(/\bperiode\b/gi, 'période')
    .replace(/\bsucces\b/gi, 'succès')
    .replace(/\breferentiel\b/gi, 'référentiel')
    .replace(/\bete\b/gi, 'été')
    .replace(/\bemise\b/gi, 'émise')
    .replace(/\bposterieure\b/gi, 'postérieure')
    .replace(/\bsignature de l employeur\b/gi, "signature de l'employeur")
}

/**
 * Message utilisateur lisible (redirect legacy, erreur servlet PF/RP, etc.).
 * @param {string | null | undefined} message
 * @returns {string}
 */
export function formatLegacyServerMessage(message) {
  const raw = String(message ?? '').trim()
  if (!raw) return ''
  return polishLegacyFrenchMessage(raw)
}

function decodeLegacyErrorParam(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, ' ')).trim()
  } catch {
    decoded = raw
  }
  return polishLegacyFrenchMessage(decoded)
}

/**
 * @param {string} text
 * @returns {string}
 */
function decodeLegacyHtmlEntities(text) {
  return String(text ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&eacute;/gi, 'é')
    .replace(/&egrave;/gi, 'è')
    .replace(/&ecirc;/gi, 'ê')
    .replace(/&agrave;/gi, 'à')
    .replace(/&ccedil;/gi, 'ç')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

/**
 * Messages renvoyés via ?error= par NouvDossier.java en cas de succès (ex. attestation X).
 * @param {string} message
 * @returns {boolean}
 */
export function isLegacyNouveauDossierSuccessMessage(message) {
  const raw = String(message ?? '').trim()
  if (!raw) return false
  return /succ[eèé]?s|felicitation|enregistr[eé]e?\s+avec/i.test(raw)
}

/**
 * @param {string} urlOrLocation
 * @returns {string | null}
 */
export function parseLegacyRedirectError(urlOrLocation) {
  if (!urlOrLocation) return null
  const raw = String(urlOrLocation)

  try {
    const url = new URL(raw, 'http://energizer.local')
    const error = url.searchParams.get('error')
    if (error) {
      const decoded = decodeLegacyErrorParam(error)
      return decoded || null
    }
  } catch {
    // Tomcat sendRedirect sans encodage : tout le texte suit error=
  }

  const match = raw.match(/[?&]error=([\s\S]*)/i)
  if (!match?.[1]) return null

  let value = match[1].trim()
  const hashIdx = value.indexOf('#')
  if (hashIdx >= 0) value = value.slice(0, hashIdx)

  const decoded = decodeLegacyErrorParam(value)
  return decoded || null
}

/**
 * Bandeau rouge de nouveauDossier.jsp après redirect ?error=…
 * @param {string} html
 * @returns {string | null}
 */
export function parseLegacyErrorFromHtml(html) {
  const raw = String(html ?? '')
  if (!raw) return null

  const fromUrl = parseLegacyRedirectError(raw)
  if (fromUrl) return fromUrl

  const redBanner = raw.match(
    /<font[^>]*color\s*=\s*["']?#FF0000["']?[^>]*>([\s\S]*?)<\/font>/i,
  )
  if (redBanner?.[1]) {
    const text = decodeLegacyHtmlEntities(redBanner[1].replace(/<[^>]+>/g, ' ')).trim()
    if (text) return text
  }

  return null
}

/**
 * Extrait le message serveur (redirect ou HTML) pour nouvdossier / pages JSP associées.
 * @param {{ error?: string | null, finalUrl?: string | null, html?: string }} response
 * @returns {string | null}
 */
export function extractLegacyNouveauDossierServerMessage(response) {
  return (
    response?.error ||
    parseLegacyRedirectError(response?.finalUrl) ||
    parseLegacyRedirectError(response?.redirectUrl) ||
    parseLegacyErrorFromHtml(response?.html) ||
    null
  )
}

/**
 * @param {string} html
 * @returns {string | null}
 */
export function parseNumdossierFromAddpieceHtml(html) {
  const raw = String(html ?? '')
  const hidden = raw.match(/name=["']numdossier["'][^>]*value=["']([^"']+)["']/i)
  if (hidden?.[1]) return hidden[1].trim()
  const titled = raw.match(/Dossier\s+N[^:]*:\s*([A-Z0-9]+)/i)
  return titled?.[1]?.trim() || null
}

/**
 * @param {string} html
 * @returns {Array<{ num_typepiece: string, libelle: string, value: string, label: string }>}
 */
export function parsePieceTypeOptionsFromAddpieceHtml(html) {
  const raw = String(html ?? '')
  const selectMatch = raw.match(
    /<select[^>]*name=["']person1["'][^>]*>([\s\S]*?)<\/select>/i,
  )
  if (!selectMatch) return []

  const options = [...selectMatch[1].matchAll(/<option[^>]*value=["']([^"']*)["'][^>]*>([^<]*)<\/option>/gi)]
  return options
    .map((match) => {
      const value = match[1].trim()
      if (!value) return null
      const underscore = value.indexOf('_')
      const num_typepiece = underscore >= 0 ? value.slice(0, underscore) : value
      const libelle = underscore >= 0 ? value.slice(underscore + 1) : match[2].trim()
      return {
        num_typepiece,
        libelle,
        value,
        label: value,
      }
    })
    .filter(Boolean)
}

/**
 * @param {string} html
 * @returns {Array<Record<string, string>>}
 */
export function parseExistingPiecesFromAddpieceRecepHtml(html) {
  const raw = String(html ?? '')
  const pieces = []
  const personRe = /name=["']person(\d+)["'][^>]*value=["']([^"']+)["']/gi
  let match

  while ((match = personRe.exec(raw)) !== null) {
    const index = match[1]
    const person = match[2].trim()
    if (!person) continue

    const titulaire = readInputValue(raw, `titulaire${index}`)
    const dateDep = readInputValue(raw, `dateDep${index}`)
    const dateVal = readInputValue(raw, `dateVal${index}`)
    const observ = readInputValue(raw, `observ${index}`)
    const nbre = readInputValue(raw, `nbre${index}`) || '1'
    const underscore = person.indexOf('_')
    const num_typepiece = underscore >= 0 ? person.slice(0, underscore) : person

    pieces.push({
      id: `${index}-${num_typepiece}`,
      person,
      titulaire,
      dateDep,
      dateVal,
      observ,
      nbre,
      num_typepiece,
      num_ordre: index,
      _readonly: true,
      _skipValidation: true,
    })
  }

  return pieces
}

/**
 * @param {string} html
 * @param {string} name
 * @returns {string}
 */
function readInputValue(html, name) {
  const re = new RegExp(`name=["']${name}["'][^>]*value=["']([^"']*)["']`, 'i')
  const alt = new RegExp(`value=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i')
  return re.exec(html)?.[1]?.trim() ?? alt.exec(html)?.[1]?.trim() ?? ''
}

/**
 * @param {string} html
 * @returns {boolean}
 */
export function isLegacySessionExpiredHtml(html) {
  return isEnergizerLegacyLoginPageHtml(html)
}
