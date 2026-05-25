import { unwrapData } from './callApi.js'

/**
 * Normalise une réponse API (tableau, { root: [] }, objet seul).
 * @param {unknown} payload
 * @returns {object[]}
 */
export function rowsFromApiPayload(payload) {
  const data = unwrapData(payload)
  if (data == null) return []
  if (Array.isArray(data)) return data.filter(Boolean)
  if (Array.isArray(data.root)) return data.root.filter(Boolean)
  if (data.root != null && typeof data.root === 'object') return [data.root]
  if (typeof data === 'object') return [data]
  return []
}

/** @param {unknown} payload */
export function firstAssureRow(payload) {
  const rows = rowsFromApiPayload(payload)
  return (
    rows.find((r) => r?.nom_complet != null && String(r.nom_complet).trim() !== '') ?? rows[0] ?? null
  )
}

/** @param {unknown} payload */
export function employeurRowsFromPayload(payload) {
  return rowsFromApiPayload(payload).filter(
    (r) =>
      r?.RAISON_SOCIALE ||
      r?.raisonsociale ||
      r?.raison_sociale ||
      r?.nomemployeur ||
      r?.NOM_COMMERCIAL,
  )
}
