import { regexPatterns } from 'src/js/regex.js'
import { buildTeleImmatPfUploadDest } from 'src/modules/shared/config/teleImmat.js'

const LEGACY_RANDOM_CHARS = 'azertyiopqsdfghjklmwxcvbn0123456789'

/** Code secret dossier PF — même alphabet que Client.php::CarAleatoire(). */
export function generateLegacyRandomCode(length = 8) {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += LEGACY_RANDOM_CHARS.charAt(Math.floor(Math.random() * LEGACY_RANDOM_CHARS.length))
  }
  return code
}

export function formatTodayFr() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/** Matricule assuré connecté (session Quasar). */
export function getDepotPfNumAssuFromSession() {
  if (typeof localStorage === 'undefined') return ''
  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) return ''
    const user = JSON.parse(raw)
    return String(user.numeroAssure || user.num_assu || user.login || '').trim()
  } catch {
    return ''
  }
}

/** Échappe une valeur pour la clause SQL legacy infoassure.jsp (cond). */
export function escapeLegacySqlLiteral(value) {
  return String(value || '').replace(/'/g, "''")
}

/**
 * Mappe la ligne infoassure.jsp vers le contexte dépôt PF (tele_prestation_pf.js).
 * @param {Record<string, string>} row
 * @param {string} numAssu
 */
export function mapInfoAssureRowToDepotPfContexte(row, numAssu) {
  if (!row || !numAssu) return null
  const sexeLabel = row.SEXE_ASSU || ''
  const sexe =
    sexeLabel === 'FEMININ' ? 'F' : sexeLabel === 'MASCULIN' ? 'M' : sexeLabel.charAt(0) || 'F'

  return {
    numAssu,
    nomAssuText: String(row.NOM_ASSU || '')
      .trim()
      .replace(/^\.+\s*/, ''),
    nom: '',
    prenom: '',
    sexe,
    sexeAssuText: sexeLabel,
    dateNaissance: row.DATE_NAISS_ASSU || '',
    dateNaissAssuText: row.DATE_NAISS_ASSU || '',
    email: row.EMAIL_ASSU || '',
    emailAssuText: row.EMAIL_ASSU || '',
    telephone: row.TEL_ASSU || '',
    telAssuText: row.TEL_ASSU || '',
    adresse: row.ADRESSE_ASSU || '',
    addrAssuText: row.ADRESSE_ASSU || '',
    Adresse: row.ADRESSE_ASSU || '',
    EMAIL_PERS: row.EMAIL_ASSU || '',
    TEL_PERS: row.TEL_ASSU || '',
    numDossier: '',
    dateCreaDoss: row.DATE_DU_JOUR || formatTodayFr(),
    laction: 'Creer',
    Dest: buildTeleImmatPfUploadDest(numAssu),
  }
}

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
