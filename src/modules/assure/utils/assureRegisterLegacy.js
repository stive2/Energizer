import { isValidMatriculeAssure, REGEX_MAT_ASSU } from 'src/modules/energizer/composables/useNouveauDossierRules.js'

export { REGEX_MAT_ASSU, isValidMatriculeAssure }

/**
 * @param {string} debutDdMmYyyy
 * @param {number|string} dureeAnnees — TYPEPIECE.duree_validite
 * @returns {string}
 */
export function calcFinValiditeFromDebut(debutDdMmYyyy, dureeAnnees) {
  const parts = String(debutDdMmYyyy ?? '').trim().split('-')
  if (parts.length !== 3) return ''
  const day = parts[0].padStart(2, '0')
  const month = parts[1].padStart(2, '0')
  const year = parseInt(parts[2], 10)
  const duree = parseInt(String(dureeAnnees ?? ''), 10)
  if (!Number.isFinite(year) || !Number.isFinite(duree)) return ''
  return `${day}-${month}-${year + duree}`
}

/**
 * @param {string} str — jj-mm-aaaa
 * @returns {Date | null}
 */
export function parseFrDateDdMmYyyy(str) {
  const parts = String(str ?? '').trim().split('-')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
  const dt = new Date(year, month, day)
  if (dt.getFullYear() !== year || dt.getMonth() !== month || dt.getDate() !== day) return null
  return dt
}

/** @returns {'invalid'|'future'|true} */
export function validateDebutValidite(debut) {
  const dt = parseFrDateDdMmYyyy(debut)
  if (!dt) return 'invalid'
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return dt > today ? 'future' : true
}

/** @returns {'invalid'|'expired'|true} */
export function validateFinValidite(fin) {
  const dt = parseFrDateDdMmYyyy(fin)
  if (!dt) return 'invalid'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dt <= today ? 'expired' : true
}

/**
 * @param {string} part1 — 3 chiffres
 * @param {string} part2 — 7 chiffres
 * @param {string} part3 — clé
 */
export function buildMatriculeAssure(part1, part2, part3) {
  const a = String(part1 ?? '').replace(/\D/g, '').padStart(3, '0').slice(-3)
  const b = String(part2 ?? '').replace(/\D/g, '').padStart(7, '0').slice(-7)
  const c = (String(part3 ?? '').replace(/\D/g, '').slice(-1) || '0')
  return `${a}-${b}-${c}`
}

/**
 * @param {string} numAssu
 */
export function splitMatriculeAssure(numAssu) {
  const full = String(numAssu ?? '').trim()
  const match = /^(\d{3})-(\d{7})-(\d)$/.exec(full)
  if (!match) {
    return { part1: '', part2: '', part3: '', full: '' }
  }
  return { part1: match[1], part2: match[2], part3: match[3], full }
}

/**
 * @param {Record<string, unknown>} row — TYPEPIECE
 */
export function mapTypePieceOption(row) {
  const code = String(row.CODE_TYPEPIECE ?? row.code_typepiece ?? '').trim()
  const label = row.LIBELLE_TYPEPIECE || row.libelle_typepiece || code
  const duree = Number(
    row.DUREE_VALIDITE ?? row.duree_validite ?? row.DUREE ?? row.valtypepiece ?? 0,
  )
  return { label, value: code, duree }
}

/** Date du jour au format jj-mm-aaaa (legacy VerifInfoAssu). */
export function formatTodayDdMmYyyy() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}-${d.getFullYear()}`
}

/**
 * @param {Array<{value:string,duree?:number}>} options
 * @param {string|number} typeCode
 * @param {Record<string, unknown>|null} assureInfoRow
 */
export function findTypePieceDuree(options, typeCode, assureInfoRow) {
  const code = String(typeCode ?? '').trim()
  const opt = options.find((o) => String(o.value) === code)
  const fromOpt = Number(opt?.duree ?? 0)
  if (fromOpt > 0) return fromOpt
  const row = assureInfoRow || {}
  return Number(row.DUREE_VALIDITE ?? row.duree_validite ?? 0)
}

/**
 * Recalcule fin_validite (et debut si besoin) — aligné VerifInfoAssu.php / calcfinval.
 * @returns {boolean} true si fin_validite a été calculée
 */
export function recalcFinValiditeForForm(form, typePieceOptions, assureInfo) {
  const duree = findTypePieceDuree(typePieceOptions, form.numtypepiece, assureInfo)
  if (duree <= 0) return false

  const debut = String(form.debut_validite ?? '').trim()
  if (!debut || validateDebutValidite(debut) !== true) {
    form.debut_validite = formatTodayDdMmYyyy()
  }

  form.fin_validite = calcFinValiditeFromDebut(form.debut_validite, duree)
  return !!form.fin_validite
}
