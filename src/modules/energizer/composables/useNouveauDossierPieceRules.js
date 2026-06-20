import { useI18n } from 'vue-i18n'
import {
  isValidPieceDate,
  parsePieceDate,
  comparePieceDates,
} from 'src/modules/energizer/utils/nouveauDossierPieces.js'

/**
 * Règles de validation pièces jointes (addpiece.jsp / addpieceRecep.jsp).
 * @param {{ mode?: 'initial' | 'reception', getDatedemande?: () => string }} options
 */
export function useNouveauDossierPieceRules(options = {}) {
  const { t } = useI18n()
  const mode = options.mode ?? 'initial'
  const getDatedemande = options.getDatedemande ?? (() => '')

  const msg = (key) => t(`reception.nouveauDossier.pieceMessages.${key}`)

  const titulaireRules = (readonly) => {
    if (readonly) return []
    return [(val) => !!String(val ?? '').trim() || msg('titulaireRequired')]
  }

  const dateDepRules = (readonly) => {
    if (readonly) return []
    const rules = [(val) => isValidPieceDate(val) || msg('invalidDate')]
    if (mode === 'reception') {
      rules.unshift((val) => !!String(val ?? '').trim() || msg('dateDepRequired'))
      rules.push((val) => {
        const dep = parsePieceDate(val)
        if (!dep) return true
        const now = new Date()
        now.setHours(23, 59, 59, 999)
        return dep <= now || msg('dateDepAfterToday')
      })
      rules.push((val) => {
        const dep = parsePieceDate(val)
        const dossierDate = parsePieceDate(getDatedemande())
        if (!dep || !dossierDate) return true
        return dep >= dossierDate || msg('dateDepBeforeDossier')
      })
    }
    return rules
  }

  const dateValRules = (readonly, dateDep) => {
    if (readonly) return []
    const rules = [
      (val) => !!String(val ?? '').trim() || msg('dateSignatureRequired'),
      (val) => isValidPieceDate(val) || msg('invalidDate'),
    ]
    if (mode === 'reception') {
      rules.push((val) => {
        const sig = parsePieceDate(val)
        if (!sig) return true
        const now = new Date()
        now.setHours(23, 59, 59, 999)
        return sig <= now || msg('dateValAfterToday')
      })
    }
    rules.push((val) => {
      if (!dateDep || !val) return true
      return comparePieceDates(dateDep, val) >= 0 || msg('dateDepBeforeSignature')
    })
    return rules
  }

  const nbreRules = () => [(val) => val != null && val !== '' || msg('nbreRequired')]

  return {
    titulaireRules,
    dateDepRules,
    dateValRules,
    nbreRules,
  }
}
