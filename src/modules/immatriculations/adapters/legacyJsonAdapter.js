/**
 * Adaptateur JSON legacy ExtJS / teleImmat JSP : `{ "root": [ {...}, ... ] }`.
 */

/**
 * @param {unknown} data
 * @returns {Record<string, string>[]}
 */
export function parseLegacyRoot(data) {
  if (data == null) return []

  let payload = data
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed) return []
    try {
      payload = JSON.parse(trimmed)
    } catch {
      if (trimmed.toLowerCase().includes('erreur')) {
        throw new Error(trimmed)
      }
      return []
    }
  }

  if (Array.isArray(payload?.root)) return payload.root
  if (Array.isArray(payload)) return payload
  return []
}

/**
 * @param {unknown} data
 * @returns {Record<string, string>|null}
 */
export function firstLegacyRow(data) {
  const rows = parseLegacyRoot(data)
  return rows[0] ?? null
}

/**
 * Unifie les clés tele_imma_assure.jsp (champs cachés #formAssu vs alias SQL).
 * @param {Record<string, unknown>} row
 * @returns {Record<string, string>}
 */
export function normalizeSessionAssureInitRow(row = {}) {
  const dateEffet = row.date_effet ?? row.DATE_EFFET ?? ''
  const minDateEffet = row.min_date_effet ?? row.MIN_DATE_EFFET ?? ''
  const taux = row.taux ?? row.TAUX ?? row.TAUX_COTISATION ?? ''
  const dateDemande = row.DATE_DEMANDE ?? row.date_demande ?? ''
  return {
    ...row,
    DATE_DEMANDE: dateDemande,
    date_demande: row.date_demande ?? dateDemande,
    date_effet: dateEffet,
    DATE_EFFET: row.DATE_EFFET ?? dateEffet,
    min_date_effet: minDateEffet,
    MIN_DATE_EFFET: row.MIN_DATE_EFFET ?? minDateEffet,
    taux,
    TAUX_COTISATION: row.TAUX_COTISATION ?? taux,
    smig_annuel: row.smig_annuel ?? row.SMIG_ANNUEL ?? '',
    max_cotisation_annuel: row.max_cotisation_annuel ?? row.MAX_COTISATION_ANNUEL ?? '',
  }
}

/**
 * Extrait codeTele / codeSecret d'une URL nextPage legacy.
 * @param {string|null|undefined} nextPage
 * @returns {{ codeTele?: string, codeSecret?: string }}
 */
export function parseLegacyNextPage(nextPage) {
  if (!nextPage || typeof nextPage !== 'string') return {}
  const raw = String(nextPage).trim()
  try {
    const normalized = raw.includes('&codeTele=') && !raw.includes('?')
      ? raw.replace(/&codeTele=/, '?codeTele=')
      : raw
    const url = normalized.startsWith('http')
      ? new URL(normalized)
      : new URL(normalized, 'http://legacy.local/')
    const params = url.searchParams
    const codeTele =
      params.get('numAssu') ||
      params.get('num_assu') ||
      params.get('codeTele') ||
      undefined
    const codeSecret = params.get('codeSecret') || undefined
    if (codeTele || codeSecret) return { codeTele, codeSecret }
  } catch {
    /* fallback regex ci-dessous */
  }
  const codeTele = raw.match(/(?:^|[?&])codeTele=([^&\s]+)/i)?.[1]
  const codeSecret = raw.match(/(?:^|[?&])codeSecret=([^&\s]+)/i)?.[1]
  return { codeTele, codeSecret }
}
