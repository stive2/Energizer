/**
 * Utilitaires partagés — formats attendus par les servlets EnergizerDev (RP/PF).
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatLegacyDate(value) {
  if (value == null || value === '') return ''
  return String(value).trim().replace(/\//g, '-')
}

/**
 * Cases à cocher HTML legacy : présence de la clé avec valeur "on".
 * @param {unknown} value
 * @returns {string | undefined}
 */
export function checkboxToLegacyOn(value) {
  if (value === true || value === 'on' || value === 'OUI' || value === 'oui') {
    return 'on'
  }
  return undefined
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function toLegacyString(value) {
  if (value == null) return ''
  return String(value)
}

/**
 * @param {Record<string, unknown>} payload
 * @param {string} key
 * @param {string | undefined} value
 */
export function setLegacyCheckbox(payload, key, value) {
  const on = checkboxToLegacyOn(value)
  if (on) payload[key] = on
}

/**
 * Recherche listes PF/RP (JSP) : cbxcritere, txtvaleurdeb, txtvaleurfin.
 * @param {{ criteria?: string, start?: string, end?: string }} params
 */
export function buildLegacySearchParams(params = {}) {
  return {
    cbxcritere: params.criteria ?? '',
    txtvaleurdeb: params.start ?? '',
    txtvaleurfin: params.end ?? '',
  }
}
