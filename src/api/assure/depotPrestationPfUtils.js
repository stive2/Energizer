import { regexPatterns } from 'src/js/regex.js'

/** Normalise un matricule employeur CNPS (majuscules, tirets). */
export function normalizeMatriculeEmployeur(raw) {
  let v = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')

  if (regexPatterns.numEmpl1.test(v) || regexPatterns.numEmpl2.test(v)) {
    return v
  }

  const compact = v.replace(/-/g, '')
  const match = compact.match(/^(\d{3})(\d{7})(\d{3})?([A-Z])$/)
  if (match) {
    const [, p1, p2, p3, letter] = match
    return p3 ? `${p1}-${p2}-${p3}-${letter}` : `${p1}-${p2}-${letter}`
  }

  return v
}

export function isValidMatriculeEmployeur(matricule) {
  const v = normalizeMatriculeEmployeur(matricule)
  return regexPatterns.numEmpl1.test(v) || regexPatterns.numEmpl2.test(v)
}

export function mapEmployeurApiRow(row) {
  if (!row || typeof row !== 'object') return null
  const numeroEmployeur =
    row.numeroEmployeur ||
    row.num_employeur ||
    row.mat_employeur ||
    row.matricule ||
    ''
  const raisonsociale =
    row.raisonsociale ||
    row.RAISON_SOCIALE ||
    row.raison_sociale ||
    row.NOM_COMMERCIAL ||
    row.denominationSociale ||
    ''
  if (!raisonsociale) return null
  return {
    numeroEmployeur,
    raisonsociale,
    NOM_COMMERCIAL: row.NOM_COMMERCIAL || raisonsociale,
    ADRESSE_EMPLOYEUR: row.ADRESSE_EMPLOYEUR || row.adresse || '',
    DATE_EMB_PREM_TRAV: row.DATE_EMB_PREM_TRAV || row.date_embauche || '',
    EFFECTIF_APPROX: row.EFFECTIF_APPROX ?? row.effectif ?? '',
  }
}
