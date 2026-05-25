/**
 * Noms de champs alignés sur tele_prestation_pf.js / initInfoField (ExtJS).
 * Ne pas introduire d'autres clés pour les données persistées / soumises.
 */

export const PF_PIECE = {
  CERT_AP1: '61',
  FRAIS_AP1: '65',
  CERT_AP2: '62',
  FRAIS_AP2: '66',
  CERT_ACCOUCHEMENT: '63',
  BULLETIN_PAIE: '92_1',
  ATTESTATION_CESSATION: '94',
  ATTESTATION_AF: '210',
  ACTE_MARIAGE: '16',
  ORIGINAL_ACTE_MARIAGE: '113',
}

export const PF_ACTE_PREFIX = {
  NAISSANCE: '33_',
  CERTIFICAT_VIE: '25_',
  CERTIFICAT_SCOLARITE: '28_',
  DECLARATION_RECONNAISSANCE: '23_',
}

/** @param {number} i */
export function acteNaissanceKey(i) {
  return `${PF_ACTE_PREFIX.NAISSANCE}${i}`
}

/** @param {string} prefix @param {number} i */
export function pieceKey(prefix, i) {
  return `${prefix}${i}`
}

const ACTE_KEY_REGEX = /^33_(\d+)$/

export function isActeNaissanceKey(key) {
  return ACTE_KEY_REGEX.test(key)
}

export function parseActeNaissanceIndex(key) {
  const match = ACTE_KEY_REGEX.exec(key)
  return match ? parseInt(match[1], 10) : 0
}
