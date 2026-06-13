/**
 * Helpers partagés alignement POST legacy (employeur / assuré teleImmat).
 */

/** Précision colonnes numériques TELEIMMAS (GererAssure — évite ORA-01438). */
export const LEGACY_TELEIMMAS_DIGIT_LIMITS = {
  BP: 6,
  PHONE: 9,
  REVENU_MENSUEL: 6,
}

/** Chiffres seuls, longueur plafonnée (optionnelle). */
export function legacyBoundedDigits(val, maxLen) {
  if (val == null || val === '') return ''
  let digits = String(val).replace(/\D/g, '')
  if (
    digits.startsWith('237') &&
    maxLen === LEGACY_TELEIMMAS_DIGIT_LIMITS.PHONE &&
    digits.length > maxLen
  ) {
    digits = digits.slice(3)
  }
  if (maxLen != null && maxLen > 0 && digits.length > maxLen) {
    return digits.slice(0, maxLen)
  }
  return digits
}

/** Téléphone assuré — colonne TEL_ASSU (NUMBER). */
export function legacyPhoneDigits(val) {
  return legacyBoundedDigits(val, LEGACY_TELEIMMAS_DIGIT_LIMITS.PHONE)
}

/** Boîte postale — colonne BP_ASSU (NUMBER). */
export function legacyBpDigits(val) {
  return legacyBoundedDigits(val, LEGACY_TELEIMMAS_DIGIT_LIMITS.BP)
}

/** Revenu mensuel — colonne REVENU_MENSUEL (NUMBER). */
export function legacyRevenuMensuelDigits(val) {
  return legacyBoundedDigits(val, LEGACY_TELEIMMAS_DIGIT_LIMITS.REVENU_MENSUEL)
}

function rawDigitLength(val) {
  if (val == null || val === '') return 0
  return String(val).replace(/\D/g, '').length
}

/**
 * Validations champs numériques TELEIMMAS (BP, fax, revenu).
 * @param {Record<string, unknown>} form
 * @param {(field: string, message: string) => void} push
 */
export function collectTeleimmasNumericFieldErrors(form, push) {
  const { BP, PHONE, REVENU_MENSUEL } = LEGACY_TELEIMMAS_DIGIT_LIMITS

  if (form.BP && rawDigitLength(form.BP) > BP) {
    push('BP', `La boîte postale ne peut pas dépasser ${BP} chiffres.`)
  }
  if (form.FAX_PERS && rawDigitLength(form.FAX_PERS) > PHONE) {
    push('FAX_PERS', `Le fax ne peut pas dépasser ${PHONE} chiffres.`)
  }
  if (form.ActuelRevenu != null && form.ActuelRevenu !== '' && rawDigitLength(form.ActuelRevenu) > REVENU_MENSUEL) {
    push(
      'ActuelRevenu',
      `Le revenu mensuel ne peut pas dépasser ${REVENU_MENSUEL} chiffres.`,
    )
  }
}

/** Legacy store sexe : id F/M, libellé FEMININ/MASCULIN — POST attend F ou M. */
export function toLegacySexe(val) {
  const v = String(val ?? '').toUpperCase()
  if (v === 'F' || v === 'FEMININ') return 'F'
  if (v === 'M' || v === 'MASCULIN') return 'M'
  return val
}
