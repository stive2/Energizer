/** Régime 1 — assuré volontaire (tele_imma_assure.jsp?regime=1). */
import {
  formatDateFr,
  parseLegacyDate,
  compareDates,
  monthsBetween,
  syncLegacyHiddenFields,
  validateImmatPersonRules,
  isLegacyImageFile,
} from './immatAssuTrvLegacy.js'

export const REGIME_VOLONTAIRE = '1'

const REVENU_REGEX = /^\d{5,10}$/

export const LEGACY_VOL_TEXT_FIELDS = [
  'CODE_ORIGINEREV',
  'CODE_REGIMEAV',
  'DETAILS_ORIGINEREV',
  'DATE_DEBUT_AFFI',
  'MIN_DATE_DEBUT_AFFI',
  'DATE_DEBUT_AFFI_SOLL',
  'MONTANT_REV_ANNUEL',
  'ASSIETTE_COTISATION',
  'TAUX',
  'MONTANT_COTISATION',
  'SMIG_VALUE',
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
  'Dest',
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

function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function origineLabel(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.LIB_ORIGINEREV) return val.LIB_ORIGINEREV
  return String(val)
}

function syncOrigineHidden(form) {
  const o = form.ORIGINE_REVENU
  if (o && typeof o === 'object') {
    form.CODE_ORIGINEREV = o.CODE_ORIGINEREV || ''
    form.CODE_REGIMEAV = o.CODE_REGIME || ''
  }
}

/** Dates d'affiliation régime 1 (beforerender imma_assure.js). */
export function computeAffiliationDatesVol(session = {}) {
  const dateEffet = parseLegacyDate(session.date_effet)
  const minDateEffet = parseLegacyDate(session.min_date_effet)
  let dateDebutAffi = dateEffet || new Date()
  if (dateEffet && minDateEffet && compareDates(dateEffet, minDateEffet) < 0) {
    dateDebutAffi = minDateEffet
  }
  const last6 = addMonths(firstDayOfMonth(dateDebutAffi), -6)
  const minDebutAffi = firstDayOfMonth(last6)
  return {
    DATE_DEBUT_AFFI: formatDateFr(dateDebutAffi),
    MIN_DATE_DEBUT_AFFI: formatDateFr(minDebutAffi),
  }
}

export function initImmatAssuVolRegime1(form, session = {}) {
  const today = formatDateFr()
  const affDates = computeAffiliationDatesVol(session)
  const taux = session.taux != null && session.taux !== '' ? Number(session.taux) : null
  const smigAnnuel = session.smig_annuel != null && session.smig_annuel !== '' ? Number(session.smig_annuel) : null
  const maxCot = session.max_cotisation_annuel != null && session.max_cotisation_annuel !== '' ? Number(session.max_cotisation_annuel) : null

  Object.assign(form, {
    regime: REGIME_VOLONTAIRE,
    regimeAffi: REGIME_VOLONTAIRE,
    regimeAffiC: 'Volontaire',
    DATE_DEMANDE: session.date_demande || session.DATE_DEMANDE || today,
    date_effet: session.date_effet || '',
    taux: session.taux ?? '',
    min_date_effet: session.min_date_effet || '',
    smig_annuel: session.smig_annuel ?? '',
    max_cotisation_annuel: session.max_cotisation_annuel ?? '',
    TAUX: taux != null && !Number.isNaN(taux) ? taux : form.TAUX,
    DATE_DEBUT_AFFI: affDates.DATE_DEBUT_AFFI,
    MIN_DATE_DEBUT_AFFI: affDates.MIN_DATE_DEBUT_AFFI,
    code_tele: session.code_tele || session.codeTele || '',
    code_secret: session.code_secret || session.codeSecret || '',
    Dest: session.Dest || '',
    laction: 'Créer',
    valider: 'OUI',
    CODE_ORIGINEREV: '',
    CODE_REGIMEAV: '',
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
    file504: form.file504 ?? null,
    file507: form.file507 ?? null,
  })

  if (smigAnnuel != null && !Number.isNaN(smigAnnuel)) {
    form.SMIG_VALUE = Math.floor(smigAnnuel / 12)
  }
  if (maxCot != null && !Number.isNaN(maxCot)) {
    form._maxCotisationMensuelle = Math.floor(maxCot / 12)
  }
}

export function updateSmigFromAffiliationDate(form, dateStr) {
  const d = parseLegacyDate(dateStr)
  if (!d) return
  form.SMIG_VALUE = d.getFullYear() >= 2014 ? 36270 : 28182
}

/** Calcul assiette / cotisation (blur MONTANT_REV_ANNUEL — info_regime_assure.js). */
export function updateAssietteCotisationVol(form) {
  const revenu = Number(form.MONTANT_REV_ANNUEL)
  const taux = Number(form.TAUX)
  const smig = Number(form.SMIG_VALUE)
  const maxMensuel =
    form._maxCotisationMensuelle ??
    (form.max_cotisation_annuel ? Math.floor(Number(form.max_cotisation_annuel) / 12) : null)

  if (!revenu || Number.isNaN(revenu) || !taux || Number.isNaN(taux)) return

  let assiette = revenu / 12
  if (maxMensuel != null && !Number.isNaN(maxMensuel) && assiette - maxMensuel >= 0) {
    assiette = maxMensuel
  } else {
    assiette = Math.floor(assiette)
    if (!Number.isNaN(smig) && assiette - smig > 0) {
      // borne max = assiette calculée (legacy)
    } else if (!Number.isNaN(smig) && assiette < smig) {
      assiette = smig
    }
  }
  form.ASSIETTE_COTISATION = Math.floor(assiette)
  form.MONTANT_COTISATION = Math.ceil((form.ASSIETTE_COTISATION * taux) / 100)
}

export function validateRegime1Business(form, step = null) {
  syncOrigineHidden(form)
  const personErr = validateImmatPersonRules(form, step)
  if (personErr) return personErr

  syncLegacyHiddenFields(form)

  const checkAll = step === null || step === 7
  const check1 = step === null || step === 1

  if (check1 || checkAll) {
    if (!form.CODE_ORIGINEREV) {
      return "Veuillez choisir l'origine des revenus."
    }
    if (!form.DATE_DEBUT_AFFI_SOLL) {
      return "La date d'affiliation sollicitée est obligatoire."
    }
    if (form.MIN_DATE_DEBUT_AFFI && form.DATE_DEBUT_AFFI) {
      if (compareDates(form.DATE_DEBUT_AFFI_SOLL, form.MIN_DATE_DEBUT_AFFI) < 0) {
        return "La date d'affiliation sollicitée est antérieure à la date minimum autorisée."
      }
      if (compareDates(form.DATE_DEBUT_AFFI_SOLL, form.DATE_DEBUT_AFFI) > 0) {
        return "La date d'affiliation sollicitée est postérieure à la date d'affiliation normale."
      }
    }
    const rev = String(form.MONTANT_REV_ANNUEL ?? '')
    if (!REVENU_REGEX.test(rev)) {
      return 'Le revenu annuel doit comporter entre 5 et 10 chiffres.'
    }
    const assiette = Number(form.ASSIETTE_COTISATION)
    const smig = Number(form.SMIG_VALUE)
    if (!Number.isNaN(assiette) && !Number.isNaN(smig) && assiette < smig) {
      return `L'assiette de cotisation est inférieure au SMIG (${smig} F CFA).`
    }
    if (form.file504 && !isLegacyImageFile(form.file504)) {
      return 'La déclaration annuelle de revenu doit être une image (gif, jpeg, jpg, png).'
    }
    if (form.file507 && !isLegacyImageFile(form.file507)) {
      return 'La déclaration sur l\'honneur doit être une image (gif, jpeg, jpg, png).'
    }
    if (!form.file504) {
      return 'La déclaration annuelle de revenu est obligatoire.'
    }
    if (!form.file507) {
      return 'La déclaration sur l\'honneur (non salarié) est obligatoire.'
    }
    if (form.DATE_DEBUT_AFFI && form.DATE_NAISS_PERS && monthsBetween(form.DATE_DEBUT_AFFI, form.DATE_NAISS_PERS) < 12 * 14) {
      return 'Vous avez moins de 14 ans à la date début affiliation.'
    }
  }

  return null
}

function appendScalar(fd, key, value) {
  if (value === null || value === undefined || value === '') return
  if (typeof value === 'object') return
  fd.append(key, String(value))
}

export function buildLegacyFormDataVol(form, options = {}) {
  syncOrigineHidden(form)
  syncLegacyHiddenFields(form)

  const fd = new FormData()
  const f = { ...form }

  f.ORIGINE_REVENU = origineLabel(f.ORIGINE_REVENU)
  f.civilite =
    f.civilite && typeof f.civilite === 'object' && f.civilite.LIBELLE_MATRI
      ? f.civilite.LIBELLE_MATRI
      : f.civilite
  f.typepiece = typeof f.typepiece === 'object' && f.typepiece?.LIBELLE ? f.typepiece.LIBELLE : f.typepiece

  const arr = (v) => (v && typeof v === 'object' && v.NOM_ARROND ? v.NOM_ARROND : '')
  f.LieuNaiss = arr(f.LieuNaiss)
  f.LIEU_PIECEC = arr(f.LIEU_PIECEC)
  f.LieuNaissPere = arr(f.LieuNaissPere)
  f.LieuNaissMere = arr(f.LieuNaissMere)
  f.CODE_VILLEC = arr(f.CODE_VILLEC)
  f.NATIONALITEC =
    typeof f.NATIONALITEC === 'object' && f.NATIONALITEC?.nationalite ? f.NATIONALITEC.nationalite : f.NATIONALITEC
  f.CODE_CENTRECNPSC =
    f.CODE_CENTRECNPSC && typeof f.CODE_CENTRECNPSC === 'object' ? f.CODE_CENTRECNPSC.LIB_CENTRE : ''

  if (options.submissionType === 'temporary') f.valider = 'NON'
  else if (options.submissionType === 'definitive') f.valider = 'OUI'

  LEGACY_VOL_TEXT_FIELDS.forEach((key) => appendScalar(fd, key, f[key]))

  if (f.file504) fd.append('504', f.file504, f.file504.name)
  if (f.file507) fd.append('507', f.file507, f.file507.name)

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

  if (f.pieceIdentite && f.NUM_TYPEPIECE) {
    fd.append(f.NUM_TYPEPIECE, f.pieceIdentite, f.pieceIdentite.name)
  }
  if (f.declarationHonneur && f.NUM_TYPEPIECE !== '99') {
    fd.append('153', f.declarationHonneur, f.declarationHonneur.name)
  }

  return fd
}
