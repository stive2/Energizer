import {
  PF_ACTE_PREFIX,
  acteNaissanceKey,
  isActeNaissanceKey,
  pieceKey,
} from 'src/data/assure/depotPrestationPfLegacyFields.js'

/** Nombre maximal d'enfants sous contrôle médical (actes de naissance générés). */
export const MAX_ENFANTS_SOUS_CONTROLE_MEDICAL = 99

/**
 * @param {unknown} val
 * @returns {number} 0 si invalide, sinon 1..99
 */
export function parseNombreEnfantsSousControleAccouchement(val) {
  if (val === null || val === undefined || val === '') return 0
  const n = parseInt(String(val), 10)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(MAX_ENFANTS_SOUS_CONTROLE_MEDICAL, n)
}

/**
 * @param {unknown} val
 * @returns {number}
 */
export function parseNombreEnfantsAllocations(val) {
  if (val === null || val === undefined || val === '') return 0
  const n = parseInt(String(val), 10)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(MAX_ENFANTS_SOUS_CONTROLE_MEDICAL, n)
}

/**
 * @param {Record<string, unknown>} form
 * @param {string} prefix
 * @param {number} target
 */
function syncPieceKeysByPrefix(form, prefix, target) {
  const regex = new RegExp(`^${prefix.replace('_', '_')}(\\d+)$`)

  for (const key of Object.keys(form)) {
    const match = regex.exec(key)
    if (match && parseInt(match[1], 10) > target) {
      delete form[key]
    }
  }

  for (let i = 1; i <= target; i += 1) {
    const key = pieceKey(prefix, i)
    if (!(key in form)) {
      form[key] = null
    }
  }
}

/**
 * Crée ou supprime les clés 33_1..N selon le nombre saisi (accouchement / maternité).
 * @param {Record<string, unknown>} form
 * @param {unknown} countOrNombre
 */
export function syncActesNaissanceAccouchement(form, countOrNombre) {
  const target = parseNombreEnfantsSousControleAccouchement(countOrNombre)
  syncPieceKeysByPrefix(form, PF_ACTE_PREFIX.NAISSANCE, target)
}

/** Supprime toutes les clés 33_* du formulaire. */
export function clearActesNaissanceKeys(form) {
  for (const key of Object.keys(form)) {
    if (isActeNaissanceKey(key)) {
      delete form[key]
    }
  }
}

/**
 * @param {unknown} nombreSousControle
 * @returns {number[]}
 */
export function getActesNaissanceIndices(nombreSousControle) {
  const n = parseNombreEnfantsSousControleAccouchement(nombreSousControle)
  return Array.from({ length: n }, (_, idx) => idx + 1)
}

/**
 * @param {{ nombEnfaMoin6?: unknown, nombEnfaPlus6?: unknown, nombEnfaReco?: unknown }} form
 * @returns {number}
 */
export function computeTotalActesAllocationsFamiliales(form) {
  const m6 = parseNombreEnfantsAllocations(form.nombEnfaMoin6)
  const p6 = parseNombreEnfantsAllocations(form.nombEnfaPlus6)
  const reco = parseNombreEnfantsAllocations(form.nombEnfaReco)
  const totalNaissance = Math.min(MAX_ENFANTS_SOUS_CONTROLE_MEDICAL, m6 + p6)
  return totalNaissance + reco
}

/**
 * Synchronise les pièces dynamiques AF (legacy addFile).
 * @param {Record<string, unknown>} form
 */
export function syncAllocationsPieces(form) {
  const m6 = parseNombreEnfantsAllocations(form.nombEnfaMoin6)
  const p6 = parseNombreEnfantsAllocations(form.nombEnfaPlus6)
  const reco = parseNombreEnfantsAllocations(form.nombEnfaReco)
  const sumMp = Math.min(MAX_ENFANTS_SOUS_CONTROLE_MEDICAL, m6 + p6)

  syncPieceKeysByPrefix(form, PF_ACTE_PREFIX.CERTIFICAT_VIE, m6)
  syncPieceKeysByPrefix(form, PF_ACTE_PREFIX.CERTIFICAT_SCOLARITE, sumMp)
  syncPieceKeysByPrefix(form, PF_ACTE_PREFIX.NAISSANCE, sumMp)
  syncPieceKeysByPrefix(form, PF_ACTE_PREFIX.DECLARATION_RECONNAISSANCE, reco)
}

/**
 * @param {Record<string, unknown>} form
 * @param {string} prefix
 * @returns {number[]}
 */
export function getPieceIndicesByPrefix(form, prefix) {
  const regex = new RegExp(`^${prefix.replace('_', '_')}(\\d+)$`)
  const indices = []
  for (const key of Object.keys(form)) {
    const match = regex.exec(key)
    if (match) {
      indices.push(parseInt(match[1], 10))
    }
  }
  return indices.sort((a, b) => a - b)
}

export { acteNaissanceKey }

/** @deprecated Alias legacy — supprime les clés 33_* */
export function clearAccouchementActesNaissance(form) {
  clearActesNaissanceKeys(form)
}
