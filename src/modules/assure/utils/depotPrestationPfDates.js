export function hasCompletePfDate(val) {
  return String(val || '').replace(/\D/g, '').length >= 8
}

export function parsePfDate(val) {
  const match = String(val || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function pfDateToQuasar(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

export function isPfFinOnOrAfterDebut(finVal, debutVal) {
  if (!hasCompletePfDate(finVal) || !hasCompletePfDate(debutVal)) return true
  const fin = parsePfDate(finVal)
  const debut = parsePfDate(debutVal)
  if (!fin || !debut) return true
  return fin >= debut
}

export function validatePfDateRange(debut, fin, errorKey, errors) {
  if (!hasCompletePfDate(debut) || !hasCompletePfDate(fin)) return
  if (!isPfFinOnOrAfterDebut(fin, debut)) errors.push(errorKey)
}
