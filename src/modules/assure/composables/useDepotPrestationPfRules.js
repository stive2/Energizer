import { useI18n } from 'vue-i18n'
import { isValidMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { isValidCameroonPhone } from 'src/js/regex.js'
import { LEGACY_FORM_FILE_MAX_SIZE } from 'src/modules/immatriculations/utils/immatLegacyCommon.js'

export function useDepotPrestationPfRules() {
  const { t } = useI18n()

  const required = (val) => !!val || val === 0 || t('input.requis')

  const validateEmail = (val) => {
    if (!val) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('errors.invalidEmail')
  }

  const validateMatriculeCNPS = (val) => {
    if (!val) return true
    return isValidMatriculeEmployeur(val) || t('errors.invalid_cnps_format')
  }

  const validateTelephone = (val) =>
    (val != null && String(val).trim() !== '' && isValidCameroonPhone(val)) ||
    t('input.invalidPhone')

  const optionsDn = (date) => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return date <= `${yyyy}/${mm}/${dd}`
  }

  const fileTypesPieces = (val) => {
    if (!val) return true
    const file = Array.isArray(val) ? val[0] : val
    const name = typeof val === 'string' ? val : file?.name
    if (file?.size > LEGACY_FORM_FILE_MAX_SIZE) {
      return t('form.file_too_large')
    }
    return (
      /\.(gif|jpe?g|png|pdf|xlsx?|docx?)$/i.test(name || '') ||
      t('modules.assure.depotPf.errors.fileType')
    )
  }

  /** Libellé affiché (l’astérisque obligatoire est ajoutée en CSS via `requiredFieldClass`). */
  const fieldLabel = (text) => String(text || '').trim()

  /** Classe à poser sur q-input / q-select / q-file / q-checkbox si le champ est requis. */
  const requiredFieldClass = (isRequired = false) =>
    isRequired ? 'depot-pf-field--required' : ''

  return {
    required,
    fieldLabel,
    requiredFieldClass,
    validateEmail,
    validateMatriculeCNPS,
    validateTelephone,
    optionsDn,
    fileTypesPieces,
    legacyFileMaxSize: LEGACY_FORM_FILE_MAX_SIZE,
  }
}
