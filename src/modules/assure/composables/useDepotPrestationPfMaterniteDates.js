import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  hasCompletePfDate,
  parsePfDate,
  pfDateToQuasar,
  isPfFinOnOrAfterDebut,
} from 'src/modules/assure/utils/depotPrestationPfDates.js'

/**
 * Contraintes de dates congé maternité — alignées sur tele_prestation_pf.js (ExtJS).
 * @param {import('vue').ComputedRef<Record<string, unknown>>} form
 * @param {(date: string) => boolean} optionsDn — dates passées uniquement
 */
export function useDepotPrestationPfMaterniteDates(form, optionsDn) {
  const { t } = useI18n()

  function optionsOnOrAfter(debutVal) {
    return (date) => {
      if (!optionsDn(date)) return false
      const debut = parsePfDate(debutVal)
      if (!debut) return true
      return date >= pfDateToQuasar(debut)
    }
  }

  const optionsFinConge = (date) => optionsOnOrAfter(form.value.dateDebuCongEffe)(date)

  const optionsFinNonSala = (date) => optionsOnOrAfter(form.value.dateDebuNonSala)(date)

  const optionsReprActi = (date) => {
    if (!optionsDn(date)) return false
    const refDate =
      parsePfDate(form.value.dateFinCongEffe) || parsePfDate(form.value.dateDebuCongEffe)
    if (!refDate) return true
    return date >= pfDateToQuasar(refDate)
  }

  function validateFinConge(val) {
    if (!val) return true
    return (
      isPfFinOnOrAfterDebut(val, form.value.dateDebuCongEffe) ||
      t('modules.assure.depotPf.errors.maternite_dates_conge_incoherentes')
    )
  }

  function validateFinNonSala(val) {
    if (!val) return true
    return (
      isPfFinOnOrAfterDebut(val, form.value.dateDebuNonSala) ||
      t('modules.assure.depotPf.errors.maternite_dates_non_salaire_incoherentes')
    )
  }

  watch(
    () => form.value.dateDebuCongEffe,
    (debut) => {
      if (!hasCompletePfDate(debut)) return
      if (!hasCompletePfDate(form.value.dateDebuNonSala)) {
        form.value.dateDebuNonSala = debut
      }
      if (
        hasCompletePfDate(form.value.dateFinCongEffe) &&
        !isPfFinOnOrAfterDebut(form.value.dateFinCongEffe, debut)
      ) {
        form.value.dateFinCongEffe = ''
      }
    },
  )

  watch(
    () => form.value.dateDebuNonSala,
    (debut) => {
      if (!hasCompletePfDate(debut)) return
      if (
        hasCompletePfDate(form.value.dateFinNonSala) &&
        !isPfFinOnOrAfterDebut(form.value.dateFinNonSala, debut)
      ) {
        form.value.dateFinNonSala = ''
      }
    },
  )

  watch(
    () => form.value.dateFinCongEffe,
    (fin) => {
      if (!hasCompletePfDate(fin)) return
      if (
        hasCompletePfDate(form.value.dateReprActi) &&
        !isPfFinOnOrAfterDebut(form.value.dateReprActi, fin)
      ) {
        form.value.dateReprActi = ''
      }
    },
  )

  return {
    optionsFinConge,
    optionsFinNonSala,
    optionsReprActi,
    validateFinConge,
    validateFinNonSala,
  }
}
