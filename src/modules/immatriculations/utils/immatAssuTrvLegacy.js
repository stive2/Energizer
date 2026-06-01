/** Régime 0 — assuré travailleur obligatoire (tele_imma_assure.jsp?regime=0). */
export const REGIME_TRAVAILLEUR = '0'

const ECAR_MIN_MONTHS = 12 * 14

export const LEGACY_TEXT_FIELDS = [
  'mat_employeur',
  'NOM_COMMERCIAL',
  'RAISON_SOCIALE',
  'ADRESSE_EMPLOYEUR',
  'DATE_EMB_PREM_TRAV',
  'DATE_EMB_PRE_SALL',
  'CODE_categ',
  'CODE_echelon',
  'Specialite',
  'EFFECTIF_APPROX',
  'NiveauAss',
  'ActuelRevenu',
  'SMIG_VALUE',
  'Dest',
  'DATE_DEMANDE',
  'code_tele',
  'code_secret',
  'minDateAffi',
  'regimeAffi',
  'regimeAffiC',
  'regime',
  'date_effet',
  'taux',
  'min_date_effet',
  'smig_annuel',
  'max_cotisation_annuel',
  'NOM_PERS',
  'PRENOM_PERS',
  'SEXE_PERS',
  'DATE_NAISS_PERS',
  'LOCALITE_NAISS',
  'LIEU_NAISS_PERS',
  'CODE_PAYS_NAISS',
  'CIVILITE_PERS',
  'NATIONALITE',
  'NUM_TYPEPIECE',
  'NUM_PIECE',
  'DATE_PIECE',
  'LIEU_PIECE',
  'NOM_PERE',
  'PRENOM_PERE',
  'DATE_NAISS_PERSP',
  'LOCALITE_NAISS_PERE',
  'LIEU_NAISS_PERE',
  'CODE_PAYS_NAISSP',
  'DATE_DECES_PERSP',
  'NOM_MERE',
  'PRENOM_MERE',
  'DATE_NAISS_PERSM',
  'LOCALITE_NAISS_MERE',
  'LIEU_NAISS_MERE',
  'CODE_PAYS_NAISSM',
  'DATE_DECES_PERSM',
  'CODE_VILLE',
  'QUARTIER',
  'TEL_PERS',
  'FAX_PERS',
  'Adresse',
  'EMAIL_PERS',
  'BP',
  'CODE_CENTRECNPS',
  'nombEnfa',
  'nombCert',
  'nombConj',
  'laction',
  'valider',
  'etatP',
  'etatM',
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function formatDateFr(date = new Date()) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
}

export function parseLegacyDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const s = String(value).trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/').map(Number)
    return new Date(y, m - 1, d)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return null
}

export function monthsBetween(later, earlier) {
  const a = parseLegacyDate(later)
  const b = parseLegacyDate(earlier)
  if (!a || !b) return Number.POSITIVE_INFINITY
  return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
}

export function yearsBetween(later, earlier) {
  const a = parseLegacyDate(later)
  const b = parseLegacyDate(earlier)
  if (!a || !b) return Number.POSITIVE_INFINITY
  let years = a.getFullYear() - b.getFullYear()
  const m = a.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && a.getDate() < b.getDate())) years -= 1
  return years
}

export function compareDates(a, b) {
  const da = parseLegacyDate(a)
  const db = parseLegacyDate(b)
  if (!da || !db) return 0
  if (da.getTime() > db.getTime()) return 1
  if (da.getTime() < db.getTime()) return -1
  return 0
}

function arrondRecord(val) {
  if (!val) return null
  if (typeof val === 'object' && val.CODE_ARROND) return val
  return null
}

function paysCode(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.code_pays) return val.code_pays
  return String(val)
}

function centreCode(val) {
  if (!val || typeof val !== 'object' || !val.CODE_CENTRE) return ''
  return val.CODE_CENTRE
}

function pieceCode(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.NUM_TYPEPIECE) return val.NUM_TYPEPIECE
  return String(val)
}

function civiliteCode(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.CODE_MATRI) return val.CODE_MATRI
  return String(val)
}

function civiliteLabel(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.LIBELLE_MATRI) return val.LIBELLE_MATRI
  return String(val)
}

/** Téléphone / fax — chiffres seuls (GererAssure → colonnes numériques TEL_ASSU / FAX_ASSU). */
export function legacyPhoneDigits(val) {
  if (val == null || val === '') return ''
  const digits = String(val).replace(/\D/g, '')
  if (digits.startsWith('237') && digits.length > 9) {
    return digits.slice(3)
  }
  return digits
}

function legacyDigitsOnly(val) {
  if (val == null || val === '') return ''
  return String(val).replace(/\D/g, '')
}

/** Met à jour les champs cachés alignés sur imma_assure.js (select listeners). */
export function syncLegacyHiddenFields(form) {
  const ln = arrondRecord(form.LieuNaiss)
  if (ln) {
    form.LIEU_NAISS_PERS = ln.CODE_ARROND
    form.CODE_PAYS_NAISS = ln.CODE_PAYS
  }
  const lp = arrondRecord(form.LIEU_PIECEC)
  if (lp) form.LIEU_PIECE = lp.CODE_ARROND
  const lv = arrondRecord(form.CODE_VILLEC)
  if (lv) form.CODE_VILLE = lv.CODE_ARROND
  const lnp = arrondRecord(form.LieuNaissPere)
  if (lnp) {
    form.LIEU_NAISS_PERE = lnp.CODE_ARROND
    form.CODE_PAYS_NAISSP = lnp.CODE_PAYS
  }
  const lnm = arrondRecord(form.LieuNaissMere)
  if (lnm) {
    form.LIEU_NAISS_MERE = lnm.CODE_ARROND
    form.CODE_PAYS_NAISSM = lnm.CODE_PAYS
  }
  form.NATIONALITE = paysCode(form.NATIONALITEC)
  form.NUM_TYPEPIECE = pieceCode(form.typepiece)
  form.CIVILITE_PERS = civiliteCode(form.civilite)
  form.CODE_CENTRECNPS = centreCode(form.CODE_CENTRECNPSC)
  if (form.DATE_NAISS_PERS) {
    const dn = parseLegacyDate(form.DATE_NAISS_PERS)
    if (dn) {
      const min = new Date(dn)
      min.setFullYear(min.getFullYear() + 14)
      form.minDateAffi = formatDateFr(min)
    }
  }
}

export function initImmatAssuTrvRegime0(form, session = {}) {
  const today = formatDateFr()
  Object.assign(form, {
    regime: REGIME_TRAVAILLEUR,
    regimeAffi: REGIME_TRAVAILLEUR,
    regimeAffiC: 'Obligatoire',
    DATE_DEMANDE: session.date_demande || session.DATE_DEMANDE || today,
    date_effet: session.date_effet || '',
    taux: session.taux || '',
    min_date_effet: session.min_date_effet || '',
    smig_annuel: session.smig_annuel || '',
    max_cotisation_annuel: session.max_cotisation_annuel || '',
    code_tele: session.code_tele || session.codeTele || '',
    code_secret: session.code_secret || session.codeSecret || '',
    Dest: session.Dest || 'dossiers/assure/immas/',
    laction: 'Créer',
    valider: 'OUI',
    nombEnfa: form.nombEnfa ?? 0,
    nombCert: form.nombCert ?? 0,
    nombConj: form.nombConj ?? 0,
    LIEU_NAISS_PERS: '',
    CODE_PAYS_NAISS: '',
    CIVILITE_PERS: '',
    NATIONALITE: '',
    NUM_TYPEPIECE: '',
    LIEU_PIECE: '',
    CODE_VILLE: '',
    CODE_CENTRECNPS: '',
    LIEU_NAISS_PERE: '',
    CODE_PAYS_NAISSP: '',
    LIEU_NAISS_MERE: '',
    CODE_PAYS_NAISSM: '',
    pieceIdentite: form.pieceIdentite ?? null,
    declarationHonneur: form.declarationHonneur ?? null,
  })
}

const IMAGE_EXT = /\.(gif|jpe?g|png)$/i

export function isLegacyImageFile(file) {
  return file && IMAGE_EXT.test(file.name || '')
}

/**
 * Validations communes assuré / parents (régime 0 et 1).
 * @param {(field: string, message: string) => void} push
 */
function collectImmatPersonValidationErrors(form, step, push) {
  syncLegacyHiddenFields(form)

  const checkAll = step === null || step === 7
  const check2 = step === null || step === 2
  const check3 = step === null || step === 3
  const check4 = step === null || step === 4
  const check6 = step === null || step === 6

  if (check2 || checkAll) {
    if (!form.LIEU_NAISS_PERS) {
      push('LieuNaiss', "L'arrondissement de naissance de l'assuré est obligatoire.")
    }
    if (form.NUM_TYPEPIECE && !form.pieceIdentite) {
      push('pieceIdentite', "La pièce d'identité est obligatoire.")
    }
    if (form.NUM_TYPEPIECE && form.NUM_TYPEPIECE !== '99' && !form.declarationHonneur) {
      push('declarationHonneur', "La déclaration sur l'honneur est obligatoire.")
    }
    const refDate = form.DATE_DEMANDE || formatDateFr()
    if (monthsBetween(refDate, form.DATE_NAISS_PERS) < ECAR_MIN_MONTHS) {
      push('DATE_NAISS_PERS', 'Vous avez moins de 14 ans à ce jour.')
    }
    if (yearsBetween(new Date(), form.DATE_NAISS_PERS) < 14) {
      push('DATE_NAISS_PERS', 'Vous avez moins de 14 ans.')
    }
  }

  if (check3 || check4 || checkAll) {
    if (form.DATE_NAISS_PERSM && compareDates(form.DATE_NAISS_PERSM, form.DATE_NAISS_PERS) === 1) {
      push('DATE_NAISS_PERSM', "Date de naissance de l'assuré antérieure à celle de sa mère.")
    }
    if (form.DATE_NAISS_PERSM && yearsBetween(form.DATE_NAISS_PERS, form.DATE_NAISS_PERSM) <= 8) {
      push('DATE_NAISS_PERSM', "Écart d'âge trop petit entre le travailleur et sa mère.")
    }
    const pere = (form.NOM_PERE || '').trim()
    if (pere && pere.length > 0 && pere !== 'PND') {
      if (form.DATE_NAISS_PERSP && compareDates(form.DATE_NAISS_PERSP, form.DATE_NAISS_PERS) === 1) {
        push('DATE_NAISS_PERSP', "Date de naissance de l'assuré antérieure à celle de son père.")
      }
      if (form.DATE_NAISS_PERSP && yearsBetween(form.DATE_NAISS_PERS, form.DATE_NAISS_PERSP) <= 12) {
        push('DATE_NAISS_PERSP', "Écart d'âge trop petit entre le travailleur et son père.")
      }
    } else if (form.LOCALITE_NAISS_PERE || form.DATE_NAISS_PERSP) {
      push('NOM_PERE', 'Saisissez à nouveau les informations du père ou bien laissez les vides.')
    }
  }

  if (check2 || checkAll) {
    if (form.pieceIdentite && !isLegacyImageFile(form.pieceIdentite)) {
      push('pieceIdentite', "La pièce d'identité doit être une image (gif, jpeg, jpg, png).")
    }
    if (
      form.NUM_TYPEPIECE &&
      form.NUM_TYPEPIECE !== '99' &&
      form.declarationHonneur &&
      !isLegacyImageFile(form.declarationHonneur)
    ) {
      push('declarationHonneur', "La déclaration sur l'honneur doit être une image (gif, jpeg, jpg, png).")
    }
  }

  if (check6 || checkAll) {
    if (form.SEXE_PERS === 'FEMININ' && Number(form.nombConj) > 1) {
      push('nombConj', "Une assurée ne peut avoir qu'un seul conjoint déclaré.")
    }
  }
}

/**
 * Validations communes assuré / parents (régimes 0 et 1).
 * @returns {string|null}
 */
export function validateImmatPersonRules(form, step = null) {
  const errors = []
  collectImmatPersonValidationErrors(form, step, (field, message) => errors.push({ field, message }))
  return errors[0]?.message ?? null
}

/**
 * Validations métier régime 0 — liste des erreurs par champ.
 * @returns {{ field: string, message: string }[]}
 */
export function collectRegime0ValidationErrors(form, step = null) {
  const errors = []
  const push = (field, message) => errors.push({ field, message })

  collectImmatPersonValidationErrors(form, step, push)

  syncLegacyHiddenFields(form)

  const checkAll = step === null || step === 7
  const check1 = step === null || step === 1

  if (check1 || checkAll) {
    if (
      form.DATE_EMB_PRE_SALL &&
      monthsBetween(form.DATE_EMB_PRE_SALL, form.DATE_NAISS_PERS) < ECAR_MIN_MONTHS
    ) {
      push('DATE_EMB_PRE_SALL', "Vous avez moins de 14 ans à la date d'embauche.")
    }
    if (
      form.DATE_EMB_PREM_TRAV &&
      form.DATE_EMB_PRE_SALL &&
      compareDates(form.DATE_EMB_PREM_TRAV, form.DATE_EMB_PRE_SALL) === 1
    ) {
      push(
        'DATE_EMB_PRE_SALL',
        'Votre date embauche chez cet employeur est antérieure à sa date première embauche.',
      )
    }
    const revenu = Number(form.ActuelRevenu)
    const smig = Number(form.SMIG_VALUE)
    if (
      form.ActuelRevenu !== '' &&
      form.ActuelRevenu != null &&
      !Number.isNaN(revenu) &&
      !Number.isNaN(smig) &&
      revenu - smig < 0
    ) {
      push('ActuelRevenu', `Le salaire est inférieur au smig ${smig} F CFA.`)
    }
    if (form.avisEmbauche && !isLegacyImageFile(form.avisEmbauche)) {
      push('avisEmbauche', "L'avis d'embauche doit être une image (gif, jpeg, jpg, png).")
    }
  }

  return errors
}

/** @returns {Record<string, string>} */
export function validateRegime0BusinessFieldMap(form, step = null) {
  const map = {}
  for (const { field, message } of collectRegime0ValidationErrors(form, step)) {
    if (!map[field]) map[field] = message
  }
  return map
}

/**
 * Validations métier régime 0 (handler Valider + contrôles par étape).
 * @returns {string|null} message d'erreur ou null si OK
 */
export function validateRegime0Business(form, step = null) {
  const errors = collectRegime0ValidationErrors(form, step)
  return errors[0]?.message ?? null
}

function appendScalar(fd, key, value) {
  if (value === null || value === undefined || value === '') return
  if (typeof value === 'object') return
  fd.append(key, String(value))
}

/**
 * FormData avec noms de champs identiques au POST GererAssure / formulaire ExtJS.
 */
export function buildLegacyFormData(form, options = {}) {
  syncLegacyHiddenFields(form)
  const fd = new FormData()
  const f = { ...form }

  f.civilite = civiliteLabel(f.civilite)
  f.typepiece = typeof f.typepiece === 'object' && f.typepiece?.LIBELLE ? f.typepiece.LIBELLE : f.typepiece
  f.LieuNaiss = arrondRecord(f.LieuNaiss)?.NOM_ARROND || ''
  f.LIEU_PIECEC = arrondRecord(f.LIEU_PIECEC)?.NOM_ARROND || ''
  f.LieuNaissPere = arrondRecord(f.LieuNaissPere)?.NOM_ARROND || ''
  f.LieuNaissMere = arrondRecord(f.LieuNaissMere)?.NOM_ARROND || ''
  f.CODE_VILLEC = arrondRecord(f.CODE_VILLEC)?.NOM_ARROND || ''
  f.NATIONALITEC = typeof f.NATIONALITEC === 'object' && f.NATIONALITEC?.nationalite ? f.NATIONALITEC.nationalite : f.NATIONALITEC
  const centreObj =
    f.CODE_CENTRECNPSC && typeof f.CODE_CENTRECNPSC === 'object' ? f.CODE_CENTRECNPSC : null
  const centreCodeVal = centreObj?.CODE_CENTRE || f.CODE_CENTRECNPS || ''
  f.codeCentrePrefText = centreCodeVal
  f.CODE_CENTRECNPS = centreCodeVal
  f.CODE_CENTRECNPSC = centreObj?.LIB_CENTRE || ''

  f.TEL_PERS = legacyPhoneDigits(f.TEL_PERS)
  f.FAX_PERS = legacyPhoneDigits(f.FAX_PERS)
  if (f.ActuelRevenu != null && f.ActuelRevenu !== '') {
    f.ActuelRevenu = legacyDigitsOnly(f.ActuelRevenu)
  }
  if (f.EFFECTIF_APPROX != null && f.EFFECTIF_APPROX !== '') {
    f.EFFECTIF_APPROX = legacyDigitsOnly(f.EFFECTIF_APPROX)
  }
  if (f.CODE_categ != null && f.CODE_categ !== '') {
    f.CODE_categ = String(f.CODE_categ)
  }
  if (f.CODE_echelon != null && f.CODE_echelon !== '') {
    f.CODE_echelon = String(f.CODE_echelon)
  }

  if (options.submissionType === 'temporary') f.valider = 'NON'
  else if (options.submissionType === 'definitive') f.valider = 'OUI'

  LEGACY_TEXT_FIELDS.forEach((key) => appendScalar(fd, key, f[key]))
  appendScalar(fd, 'codeCentrePrefText', f.codeCentrePrefText)

  if (f.avisEmbauche) fd.append('110', f.avisEmbauche, f.avisEmbauche.name)
  if (f.pieceIdentite && f.NUM_TYPEPIECE) {
    fd.append(f.NUM_TYPEPIECE, f.pieceIdentite, f.pieceIdentite.name)
  }
  if (f.declarationHonneur && f.NUM_TYPEPIECE !== '99') {
    fd.append('153', f.declarationHonneur, f.declarationHonneur.name)
  }

  const nEnf = Number(f.nombEnfa) || 0
  for (let i = 0; i < nEnf; i++) {
    const file = f.actesNaissance?.[i]
    if (file) fd.append(`33_${i + 1}`, file, file.name)
  }
  const nCert = Number(f.nombCert) || 0
  for (let i = 0; i < nCert; i++) {
    const file = f.certificatsTravail?.[i]
    if (file) fd.append(`34_${i + 1}`, file, file.name)
  }
  const nConj = Number(f.nombConj) || 0
  for (let i = 0; i < nConj; i++) {
    const file = f.actesMariage?.[i]
    if (file) fd.append(`32_${i + 1}`, file, file.name)
  }

  return fd
}
