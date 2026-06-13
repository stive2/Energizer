import { regexPatterns } from 'src/js/regex.js'
import { toLegacyString, toLegacyUppercase } from './liquidationLegacyUtils.js'

export { toLegacyUppercase }

/** Champs qui ne doivent jamais être convertis en majuscules (saisie ou payload). */
export const LEGACY_SENSITIVE_FIELD_KEYS = new Set([
  'userpassword',
  'password',
  'mot2passe',
  'code_secret',
  'email',
  'telephone',
  'tel',
])

/**
 * @param {string} fieldKey
 * @param {string} [inputType]
 */
export function isLegacySensitiveField(fieldKey, inputType = '') {
  const key = String(fieldKey ?? '').toLowerCase()
  const type = String(inputType ?? '').toLowerCase()
  if (type === 'password' || type === 'email' || type === 'tel') return true
  if (LEGACY_SENSITIVE_FIELD_KEYS.has(key)) return true
  return /password|secret|mot2passe|motdepasse/i.test(key)
}

/** Attributs Quasar communs pour un champ téléphone legacy (+237, 9 chiffres). */
export const LEGACY_TELEPHONE_INPUT_ATTRS = {
  type: 'tel',
  maxlength: 9,
  prefix: '+237',
}

/**
 * Règles de validation téléphone (même logique que ImmatEmpPro.vue).
 * @param {(key: string) => string} t
 * @param {{ required?: boolean }} [options]
 */
export function buildLegacyTelephoneRules(t, { required = false } = {}) {
  const rules = []
  if (required) {
    rules.push((val) => (val != null && String(val).trim() !== '') || t('input.requis'))
  }
  rules.push(
    (val) => !val || regexPatterns.telephone.test(String(val)) || t('input.invalidPhone'),
  )
  return rules
}

/**
 * Met à jour un champ texte du formulaire en majuscules (saisie legacy Energizer).
 * @param {Record<string, unknown>} target
 * @param {string} key
 * @param {unknown} value
 */
export function setLegacyUppercaseText(target, key, value, options = {}) {
  const inputType = options.inputType ?? ''
  if (isLegacySensitiveField(key, inputType)) {
    target[key] = toLegacyString(value)
    return
  }
  target[key] = toLegacyUppercase(value)
}
