import { useI18n } from 'vue-i18n'
import { isValidMatriculeEmployeur } from 'src/api/assure/depotPrestationPfUtils.js'

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
  const optionsDn = (date) => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return date <= `${yyyy}/${mm}/${dd}`
  }

  const fileTypesPieces = (val) => {
    if (!val) return true
    const name = typeof val === 'string' ? val : val.name
    return (
      /\.(gif|jpe?g|pdf|xlsx?)$/i.test(name) ||
      t('modules.assure.depotPf.errors.fileType')
    )
  }

  return {
    required,
    validateEmail,
    validateMatriculeCNPS,
    optionsDn,
    fileTypesPieces,
  }
}
