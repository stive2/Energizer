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
    .replace(/d[eé]j[ï¿½\ufffd]+/gi, 'déjà')
    .replace(/syst[eè]m[eé]/gi, 'système')
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
  {
    test: (t) => /accident survenu le/i.test(t),
    message: (t) => {
      const date = t.match(/survenu le\s*:?\s*([\d/.-]+)/i)?.[1]?.trim()
      if (date) {
        return `Enregistrement refusé : un dossier de risque professionnel existe déjà pour cet assuré, pour un accident survenu le ${date}. Consultez les dossiers en cours ou modifiez la date d'accident si la saisie est incorrecte.`
      }
      return "Enregistrement refusé : un dossier de risque professionnel existe déjà pour cet assuré avec cette date d'accident. Consultez les dossiers en cours ou modifiez la date saisie."
    },
  },
  {
    test: (t) => /dossier de .+ est en cours de traitement/i.test(t),
    message: (t) => {
      const dossier = t.match(/CPS de\s+([A-Z0-9]+)/i)?.[1]?.trim()
      const mat = t.match(/assur[eé]\s+([0-9-]+)/i)?.[1]?.trim()
      if (dossier && mat) {
        return `Un dossier est déjà en cours de traitement (n° ${dossier}) pour l'assuré ${mat}.`
      }
      return 'Un dossier est déjà en cours de traitement pour cet assuré.'
    },
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
  if (known) {
    return typeof known.message === 'function' ? known.message(out) : known.message
  }
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

/**
 * Détecte une page HTML (SPA Vite, login, etc.) renvoyée à la place d'un message métier.
 * @param {string} text
 * @returns {boolean}
 */
export function isSpaOrHtmlDocument(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return false
  if (raw.length > 280 && /^<!doctype\s+html/i.test(raw)) return true
  if (/<html[\s>]/i.test(raw) && /<body[\s>]/i.test(raw)) return true
  if (/vite-plugin-checker-runtime|\/@vite\/client|id=["']q-app["']/i.test(raw)) return true
  return false
}

/**
 * Retire le bruit HTML éventuellement concaténé à un paramètre ?error=.
 * @param {string} value
 * @returns {string}
 */
function trimLegacyErrorValue(value) {
  let v = String(value ?? '').trim()
  const htmlIdx = v.search(/<!doctype\s+html|<html[\s>]/i)
  if (htmlIdx > 0) v = v.slice(0, htmlIdx).trim()
  if (v.length > 600) v = `${v.slice(0, 600).trim()}…`
  return v
}

const NOUVEAU_DOSSIER_GENERIC_ERROR =
  "Enregistrement impossible. Vérifiez les informations saisies, votre session Energizer, puis réessayez."

const NOUVEAU_DOSSIER_HTML_RESPONSE_ERROR =
  "Enregistrement impossible : le serveur a renvoyé une page web au lieu d'une réponse métier. Vérifiez votre connexion à Energizer et réessayez."

/**
 * Message d'erreur lisible pour l'utilisateur (nouveau dossier / pièces jointes).
 * @param {string | null | undefined} message
 * @param {string} [fallback]
 * @returns {string}
 */
export function toUserFacingNouveauDossierError(message, fallback = NOUVEAU_DOSSIER_GENERIC_ERROR) {
  const raw = String(message ?? '').trim()
  if (!raw) return fallback
  if (isSpaOrHtmlDocument(raw)) return NOUVEAU_DOSSIER_HTML_RESPONSE_ERROR
  const formatted = formatLegacyServerMessage(raw)
  if (!formatted || isSpaOrHtmlDocument(formatted)) return NOUVEAU_DOSSIER_HTML_RESPONSE_ERROR
  return formatted
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
 * Extrait la valeur brute de ?error= (legacy Tomcat non encodé : &eacute; ne doit pas couper le message).
 * @param {string} urlOrLocation
 * @returns {string | null}
 */
function extractRawLegacyErrorParam(urlOrLocation) {
  const raw = String(urlOrLocation ?? '')
  const match = raw.match(/[?&]error=([\s\S]*)/i)
  if (!match?.[1]) return null

  let value = match[1].trim()
  const hashIdx = value.indexOf('#')
  if (hashIdx >= 0) value = value.slice(0, hashIdx)
  return trimLegacyErrorValue(value)
}

/**
 * @param {string} urlOrLocation
 * @returns {string | null}
 */
export function parseLegacyRedirectError(urlOrLocation) {
  if (!urlOrLocation) return null
  const raw = String(urlOrLocation)

  const fromRawParam = extractRawLegacyErrorParam(raw)
  if (fromRawParam) {
    const decoded = decodeLegacyErrorParam(fromRawParam)
    if (decoded) return decoded
  }

  try {
    const url = new URL(raw, 'http://energizer.local')
    const error = url.searchParams.get('error')
    if (error) {
      const decoded = decodeLegacyErrorParam(error)
      if (decoded) return decoded
    }
  } catch {
    /* URL relative ou redirect Tomcat non standard */
  }

  return null
}

/**
 * Bandeau rouge de nouveauDossier.jsp après redirect ?error=…
 * @param {string} html
 * @returns {string | null}
 */
export function parseLegacyErrorFromHtml(html) {
  const raw = String(html ?? '')
  if (!raw || isSpaOrHtmlDocument(raw)) return null

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
  const candidates = [
    response?.error,
    parseLegacyRedirectError(response?.finalUrl),
    parseLegacyRedirectError(response?.redirectUrl),
    parseLegacyErrorFromHtml(response?.html),
  ]

  for (const candidate of candidates) {
    const text = String(candidate ?? '').trim()
    if (!text || isSpaOrHtmlDocument(text)) continue
    return text
  }

  return null
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
 * Champs cachés addpieceRecep.jsp (session agent, centre, contexte dossier).
 * @param {string} html
 */
export function parseAddpieceRecepHiddenFields(html) {
  const raw = String(html ?? '')
  const readHidden = (name) => {
    const byName =
      raw.match(new RegExp(`name=["']${name}["'][^>]*value=["']([^"']*)["']`, 'i')) ??
      raw.match(new RegExp(`value=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'))
    const byId =
      raw.match(new RegExp(`id=["']${name}["'][^>]*value=["']([^"']*)["']`, 'i')) ??
      raw.match(new RegExp(`value=["']([^"']*)["'][^>]*id=["']${name}["']`, 'i'))
    return (byName?.[1] ?? byId?.[1] ?? '').trim()
  }

  return {
    username: readHidden('username'),
    code_centre_user: readHidden('code_centre_user'),
    objet: readHidden('objet'),
    numassu: readHidden('numassu'),
    nom_complet: readHidden('nom_complet'),
    date_naiss: readHidden('date_naiss'),
    myname: readHidden('myname'),
    myobjet: readHidden('myobjet'),
    datedemande: readHidden('datedemande'),
    telephone: readHidden('telephone'),
    adresse: readHidden('adresse'),
  }
}

function mapLegacyPieceTypeOption(rawValue, labelText) {
  const value = String(rawValue ?? '').trim()
  if (!value) return null
  const label = String(labelText ?? value).trim() || value
  const underscore = value.indexOf('_')
  const num_typepiece = underscore >= 0 ? value.slice(0, underscore) : value
  const libelle = underscore >= 0 ? value.slice(underscore + 1) : label
  return {
    num_typepiece,
    libelle,
    value,
    label: value,
  }
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
  return options.map((match) => mapLegacyPieceTypeOption(match[1], match[2])).filter(Boolean)
}

/**
 * addpieceRecep.jsp génère les options dans addRow() (JS), pas dans un &lt;select name="person1"&gt;.
 * @param {string} html
 * @returns {Array<{ num_typepiece: string, libelle: string, value: string, label: string }>}
 */
export function parsePieceTypeOptionsFromAddpieceRecepHtml(html) {
  const raw = String(html ?? '')
  const options = []
  const seen = new Set()
  const optionRe =
    /element\.options\[\s*\d+\s*\]\s*=\s*new\s+Option\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/gi

  for (const match of raw.matchAll(optionRe)) {
    const mapped = mapLegacyPieceTypeOption(match[2], match[1])
    if (!mapped || seen.has(mapped.value)) continue
    seen.add(mapped.value)
    options.push(mapped)
  }

  return options
}

/**
 * @param {string} html
 * @returns {Array<{ num_typepiece: string, libelle: string, value: string, label: string }>}
 */
export function parsePieceTypeOptionsFromLegacyPiecesHtml(html) {
  const fromRecep = parsePieceTypeOptionsFromAddpieceRecepHtml(html)
  if (fromRecep.length) return fromRecep
  return parsePieceTypeOptionsFromAddpieceHtml(html)
}

/**
 * @param {string} cellHtml
 * @returns {string}
 */
function readLegacyTableCellText(cellHtml) {
  return decodeLegacyHtmlEntities(
    String(cellHtml ?? '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim(),
  )
}

/**
 * Repère le tableau des pièces déjà en BDD (distinct du formulaire de saisie).
 * @param {string} html
 * @returns {string | null}
 */
function findExistingPiecesTableHtml(html) {
  const raw = String(html ?? '')
  for (const match of raw.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)) {
    const tableHtml = match[1]
    const headerChunk = tableHtml.slice(0, 800)
    if (
      /Nature de la Pi/i.test(headerChunk) &&
      /Titulaire/i.test(headerChunk) &&
      /Nbre/i.test(headerChunk)
    ) {
      return tableHtml
    }
  }

  const sectionMatch =
    raw.match(
      /Liste des Pi[eèè]ces Jointes D[eéè]j[aàè] Ajout[eéè]es[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i,
    ) ?? raw.match(/Nature de la Pi[eèè]ce[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i)

  return sectionMatch?.[1] ?? null
}

/**
 * Pièces déjà en BDD — tableau vert en tête de addpieceRecep.jsp (rstSelect4).
 * @param {string} html
 * @returns {Array<Record<string, string>>}
 */
export function parseExistingPiecesFromAddpieceRecepHtml(html) {
  const tableHtml = findExistingPiecesTableHtml(html)
  if (!tableHtml) return []

  const pieces = []
  let index = 0

  for (const rowMatch of tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const rowHtml = rowMatch[0]
    if (/Aucune pi[eèè]ce pr[eéè]alablement enregistr[eéè]e/i.test(rowHtml)) continue

    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
      readLegacyTableCellText(cell[1]),
    )
    if (cells.length < 7 || !cells[0]) continue
    if (/Nature de la Pi/i.test(cells[0]) && /Titulaire/i.test(cells[1] ?? '')) continue

    index += 1
    const insertMatch = rowHtml.match(/NAME=['"]Insert-([^'"]+)['"]/i)
    const insertKey = insertMatch?.[1] ?? ''
    const id = insertKey ? `insert-${insertKey}` : `existing-${index}`
    const numParts = insertKey.split('-')
    const num_typepiece = numParts.length >= 2 ? numParts[numParts.length - 2] : ''
    const num_ordre = numParts.length >= 1 ? numParts[numParts.length - 1] : String(index)

    pieces.push({
      id,
      person: cells[0],
      displayPerson: cells[0],
      titulaire: cells[1] ?? '',
      dateDep: cells[2] ?? '',
      dateVal: cells[3] ?? '',
      observ: cells[4] ?? '',
      nbre: cells[5] || '1',
      verifiee: cells[6] ?? '',
      num_typepiece,
      num_ordre,
      _skipValidation: true,
    })
  }

  return pieces
}

/**
 * @param {string} html
 * @returns {boolean}
 */
export function isLegacySessionExpiredHtml(html) {
  return isEnergizerLegacyLoginPageHtml(html)
}
