/**
 * Libellé affiché pour le sexe assuré (JASSURE : 1/F, 2/M).
 * @param {string|number|null|undefined} sexe
 * @param {(key: string) => string} t — vue-i18n
 */
export function formatSexeLabel(sexe, t) {
  const s = String(sexe ?? '').trim().toUpperCase()
  if (s === 'F' || s === '1' || s === 'FEMININ' || s === 'FÉMININ') {
    return t('inputassu.female')
  }
  if (s === 'M' || s === '2' || s === 'MASCULIN') {
    return t('inputassu.male')
  }
  return s || ''
}
