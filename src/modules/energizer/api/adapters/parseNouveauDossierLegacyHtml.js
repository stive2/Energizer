/**
 * Parse les réponses HTML EnergizerDev (addpiece.jsp, addpieceRecep.jsp, redirects).
 */

/**
 * @param {string} urlOrLocation
 * @returns {string | null}
 */
export function parseLegacyRedirectError(urlOrLocation) {
  if (!urlOrLocation) return null
  try {
    const url = new URL(urlOrLocation, 'http://energizer.local')
    const error = url.searchParams.get('error')
    if (!error) return null
    return decodeURIComponent(error.replace(/\+/g, ' ')).trim() || null
  } catch {
    const match = String(urlOrLocation).match(/[?&]error=([^&]+)/i)
    if (!match) return null
    try {
      return decodeURIComponent(match[1].replace(/\+/g, ' ')).trim()
    } catch {
      return match[1]
    }
  }
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
  const raw = String(html ?? '').trim()
  return (
    !raw ||
    /index\.html/i.test(raw) ||
    (raw.startsWith('<') && /userloginmid|Se connecter|login/i.test(raw) && !/numdossier/i.test(raw))
  )
}
