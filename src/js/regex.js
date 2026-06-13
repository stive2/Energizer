export const regexPatterns = {
  numAssu1: /^[0-9]{3}-[0-9]{7}-[0-9]{1}$/,
  numAssu2: /^[0-9]{3}-[0-9]{7}-[0-9]{3}-[0-9]{1}$/,
  numEmpl1: /^[0-9]{3}-[0-9]{7}-[A-Z]$/,
  numEmpl2: /^[0-9]{3}-[0-9]{7}-[0-9]{3}-[A-Z]$/,
  numContr: /^[A-Z][0-9]{12}[A-Z]$/,
  regComm: /^[A-Z]{2}\/[A-Z]{3}\/[0-9]{4}\/[A-Z]\/[0-9]{4}$/,
  email: /^[A-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  /** Cameroun : mobile 6XX… (620, 621, 640, 650, 670, etc.) ou fixe 2XX… — 9 chiffres sans indicatif. */
  telephone: /^(?:6[0-9]{8}|2[0-9]{8})$/,
}

/** Extrait les 9 chiffres nationaux (+237 optionnel, espaces/tirets ignorés). */
export function normalizeCameroonPhoneNational(val) {
  if (val == null || val === '') return ''
  let digits = String(val).replace(/\D/g, '')
  if (digits.startsWith('237') && digits.length >= 12) {
    digits = digits.slice(3)
  } else if (digits.startsWith('237') && digits.length > 9) {
    digits = digits.slice(3)
  }
  if (digits.length > 9) {
    digits = digits.slice(-9)
  }
  return digits
}

export function isValidCameroonPhone(val) {
  const digits = normalizeCameroonPhoneNational(val)
  if (!digits) return false
  return regexPatterns.telephone.test(digits)
}
