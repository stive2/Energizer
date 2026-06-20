import { useI18n } from 'vue-i18n'

/** Matricule assuré — ExtJS Exp_mat */
export const REGEX_MAT_ASSU = /^[0-9]([0-9]){2}-([0-9]){7}-[0-9]$/

/** Matricule employeur — ExtJS Exp_mat_empl */
export const REGEX_MAT_EMPL = /^[0-9]([0-9]){2}-([0-9]){7}(-([0-9]){3}){0,1}-[A-Z]$/

export function isValidMatriculeAssure(val) {
  const v = String(val || '').trim()
  return v ? REGEX_MAT_ASSU.test(v) : false
}

export function isValidMatriculeEmployeur(val) {
  const v = String(val || '').trim()
  return v ? REGEX_MAT_EMPL.test(v) : false
}

function isFilled(val) {
  if (val === 0) return true
  if (val === null || val === undefined) return false
  return String(val).trim() !== ''
}

export function useNouveauDossierRules() {
  const { t } = useI18n()

  const fieldMessage = (fieldKey) =>
    t(`reception.nouveauDossier.fieldMessages.${fieldKey}`)

  /** Règle obligatoire avec message spécifique au champ. */
  const requiredField = (fieldKey) => (val) =>
    isFilled(val) || fieldMessage(fieldKey)

  const required = (val) => isFilled(val) || t('input.requis')

  const validateEmail = (val) => {
    if (!val) return true
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
      t('reception.nouveauDossier.fieldMessages.emailInvalid')
    )
  }

  const validateMatriculeAssure = (val) => {
    if (!val) return true
    return REGEX_MAT_ASSU.test(val) || t('reception.nouveauDossier.invalidMatAssu')
  }

  const validateMatriculeEmployeur = (val) => {
    if (!val) return true
    return REGEX_MAT_EMPL.test(val) || t('reception.nouveauDossier.invalidMatEmpl')
  }

  /** Date <= today (daterange ExtJS) */
  const dateNotAfterToday = (val) => {
    if (!val) return true
    const parsed = parseFrDate(val)
    if (!parsed) return t('reception.nouveauDossier.fieldMessages.invalidDate')
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return parsed <= today || t('reception.nouveauDossier.dateFuture')
  }

  const dateRangeEndAfterStart = (startVal) => (endVal) => {
    if (!endVal || !startVal) return true
    const start = parseFrDate(startVal)
    const end = parseFrDate(endVal)
    if (!start || !end) return true
    return (
      end >= start ||
      t('reception.nouveauDossier.fieldMessages.datedeclarationAfterAccident')
    )
  }

  return {
    required,
    requiredField,
    fieldMessage,
    validateEmail,
    validateMatriculeAssure,
    validateMatriculeEmployeur,
    dateNotAfterToday,
    dateRangeEndAfterStart,
  }
}

function parseFrDate(str) {
  if (!str) return null
  if (str.includes('/')) {
    const [d, m, y] = str.split('/').map(Number)
    if (d && m && y) return new Date(y, m - 1, d)
  }
  if (str.includes('-')) {
    const d = new Date(str)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export function formatTodayFr() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
