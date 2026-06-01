import { normalizeSessionAssureInitRow } from './legacyJsonAdapter.js'

/** Champs cachés #formAssu dans tele_imma_assure.jsp (session JTAUX_COTISATION). */
export const TELE_IMMA_ASSURE_SESSION_INPUT_IDS = [
  'date_demande',
  'date_effet',
  'taux',
  'min_date_effet',
  'smig_annuel',
  'max_cotisation_annuel',
  'regime',
  'codeTele',
  'codeSecret',
  'smig',
]

function cleanHiddenValue(raw) {
  const v = String(raw ?? '').trim()
  if (!v || v === 'null' || v === 'undefined') return ''
  return v
}

function readFormAssuInput(doc, nameOrId) {
  const el =
    doc.getElementById(nameOrId) ||
    doc.querySelector(`form#formAssu input[name="${nameOrId}"]`) ||
    doc.querySelector(`input[name="${nameOrId}"]`)
  if (!el) return ''
  return cleanHiddenValue(el.getAttribute('value') ?? el.value)
}

/**
 * Extrait les paramètres de session depuis le HTML tele_imma_assure.jsp.
 * @param {string} html
 * @returns {Record<string, string>}
 */
export function parseTeleImmaAssureSessionFromHtml(html) {
  if (!html || typeof html !== 'string') {
    return normalizeSessionAssureInitRow({})
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const row = {}

  TELE_IMMA_ASSURE_SESSION_INPUT_IDS.forEach((id) => {
    const value = readFormAssuInput(doc, id)
    if (value) row[id] = value
  })

  if (row.codeTele) {
    row.code_tele = row.codeTele
  }
  if (row.codeSecret) {
    row.code_secret = row.codeSecret
  }

  return normalizeSessionAssureInitRow(row)
}

/** Indique si le HTML contient les paramètres JTAUX attendus. */
export function hasTeleImmaAssureSessionData(row = {}) {
  return Boolean(
    row.date_demande ||
      row.DATE_DEMANDE ||
      row.date_effet ||
      row.taux ||
      row.TAUX_COTISATION,
  )
}
