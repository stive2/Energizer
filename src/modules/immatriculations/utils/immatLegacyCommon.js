/**
 * Helpers partagés alignement POST legacy (employeur / assuré teleImmat).
 */

/** Précision colonnes numériques TELEIMMAS (GererAssure — évite ORA-01438). */
export const LEGACY_TELEIMMAS_DIGIT_LIMITS = {
  BP: 6,
  PHONE: 9,
  REVENU_MENSUEL: 6,
}

/** Taille max pièce jointe — alignée teleImmat / GererAssure (3 Mo). */
export const LEGACY_FORM_FILE_MAX_SIZE = 3072000

/** Pièces jointes assuré — images + PDF, max 3 Mo (aligné ImmatAssuTrv / GererAssure). */
export const LEGACY_IMMAT_ASSURE_FILE_ACCEPT =
  '.gif,.jpg,.jpeg,.png,.pdf,image/gif,image/jpeg,image/png,application/pdf'

/** Pièces jointes avec documents bureautique (employeur, dépôt PF). */
export const LEGACY_FORM_DOCUMENT_FILE_ACCEPT =
  '.gif,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,image/gif,image/jpeg,image/png,application/pdf'

/** Liste des travailleurs — Excel, Word, PDF (imma_employeur1.js). */
export const LEGACY_LISTE_TRAVAILLEURS_FILE_ACCEPT = '.xls,.xlsx,.doc,.docx,.pdf'

const LEGACY_LISTE_TRAVAILLEURS_FILE_EXT = /\.(xls|xlsx|docx?|pdf)$/i

const LEGACY_IMAGE_PDF_FILE_EXT = /\.(gif|jpe?g|png|pdf)$/i

export function normalizeLegacyUploadFile(val) {
  if (!val) return null
  return Array.isArray(val) ? val[0] : val
}

export function isLegacyImageOrPdfFile(file) {
  const f = normalizeLegacyUploadFile(file)
  return f && LEGACY_IMAGE_PDF_FILE_EXT.test(f.name || '')
}

export function isLegacyListeTravailleursFile(file) {
  const f = normalizeLegacyUploadFile(file)
  return f && LEGACY_LISTE_TRAVAILLEURS_FILE_EXT.test(f.name || '')
}

export function isLegacyImmatAssureUploadFile(file) {
  return isLegacyImageOrPdfFile(file)
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

/**
 * Ajoute un champ scalaire au FormData GererAssure.
 * Le servlet legacy (teleImmat_0.1) appelle souvent .replaceAll() sans test null :
 * les champs vides doivent être envoyés comme "" (comme le formulaire ExtJS), pas omis.
 */
export function appendLegacyFormField(fd, key, value) {
  if (value != null && typeof value === 'object') return
  fd.append(key, value == null ? '' : String(value))
}

/** Envoie tous les scalaires du formulaire (champs vides → ""), comme ExtJS teleImmat. */
export function appendLegacyFormFields(fd, form, keys) {
  for (const key of keys) {
    appendLegacyFormField(fd, key, form?.[key])
  }
}

/**
 * Prénoms optionnels côté UI legacy (imma_assure.js / imma_employeur0.js) :
 * doivent être envoyés vides au servlet, jamais omis (évite NPE replaceAll).
 */
export const LEGACY_OPTIONAL_PRENOM_FIELD_KEYS = [
  'PRENOM_PERS',
  'PRENOM_PERE',
  'PRENOM_MERE',
  'PRENOM_PERSEMPL',
]
