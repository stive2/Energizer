import { parseLegacyDate, compareDates } from 'src/modules/immatriculations/utils/immatAssuTrvLegacy.js'

function takeDateStartOfMonth(dateCar) {
  const d = parseLegacyDate(dateCar)
  if (!d) return null
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/**
 * Sélection du SMIG applicable — port de selectSmig() dans traitementFm1.js.
 * @param {Array<Record<string, string>>|null} tabSmig
 * @param {string|Date} dateFocus
 * @returns {number}
 */
export function selectSmig(tabSmig, dateFocus) {
  if (!tabSmig?.length) return 0

  const focusDate = typeof dateFocus === 'string' ? parseLegacyDate(dateFocus) : dateFocus
  if (!focusDate) return 0

  let mini = 0
  let i = tabSmig.length - 1

  while (i >= 0) {
    const row = tabSmig[i]
    const dateDebut = takeDateStartOfMonth(row.DATE_DEBUT)
    const pivot = takeDateStartOfMonth('01/03/2023')

    if (!dateDebut) {
      i -= 1
      continue
    }

    const cd = compareDates(dateDebut, focusDate)
    if (cd === 1) {
      i -= 1
      continue
    }

    const r = compareDates(dateDebut, pivot)
    if (r === 0 || r === 1) {
      if (row.REGIME === '2') {
        if (row.CODE === 'SMIG_AG') mini = Number(row.SMIG)
        else if (tabSmig[i - 1]) mini = Number(tabSmig[i - 1].SMIG)
      } else if (row.CODE === 'SMIG_AU') {
        mini = Number(row.SMIG)
      } else if (tabSmig[i - 1]) {
        mini = Number(tabSmig[i - 1].SMIG)
      }
    } else {
      mini = Number(row.SMIG)
    }
    break
  }

  return mini || 0
}
