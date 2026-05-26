/**
 * UI formulaire nouveau dossier — champs obligatoires (astérisque Quasar).
 */
import { isFieldActive, isFieldRequired } from 'src/modules/energizer/utils/nouveauDossierFieldState.js'

/** Obligatoires via règles métier quand le champ est actif (meta.required peut être false). */
const RULE_REQUIRED_KEYS = new Set([
  'datecessation',
  'datedeces',
  'dateconstatinvalid',
  'dateconstatincapacite',
  'datedemandeassuredecede',
  'natureprestation',
  'tauxinvalide',
  'dateaccident',
  'datedeclaration',
  'mat_employeur',
  'code_tele_enreg',
  'code_secret',
])

/**
 * @param {string} fieldKey
 * @param {import('vue').Ref<object>|object} fieldState
 * @param {{ group00Visible?: boolean, group03Visible?: boolean }} [groups]
 */
export function isNouveauDossierFieldRequired(fieldKey, fieldState, groups = {}) {
  const state = fieldState?.value ?? fieldState

  if (fieldKey === 'mat_employeur') {
    return groups.group00Visible === true
  }
  if (fieldKey === 'code_tele_enreg' || fieldKey === 'code_secret') {
    return groups.group03Visible === true
  }

  if (!isFieldActive(fieldKey, state)) return false
  if (isFieldRequired(fieldKey, state)) return true
  return RULE_REQUIRED_KEYS.has(fieldKey)
}
