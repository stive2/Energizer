/** Régime 1 — assuré volontaire (tele_imma_assure.jsp?regime=1). */
import {
  formatDateFr,
  parseLegacyDate,
  compareDates,
  monthsBetween,
  syncLegacyHiddenFields,
  isLegacyImageFile,
  legacyPhoneDigits,
  collectImmatPersonValidationErrors,
} from './immatAssuTrvLegacy.js'
import { appendLegacyFormField, legacyBpDigits } from './immatLegacyCommon.js'
import { selectSmig } from './selectSmig.js'
import { normalizeSessionAssureInitRow } from '../adapters/legacyJsonAdapter.js'

/** 2e argument de to_number(TAUX, taux)/100 côté servlet GererAssure (masque Oracle, pas le taux %). */
export const GERER_ASSURE_TAUX_ORACLE_FORMAT = '9.99'

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

function parseLegacyNumber(val) {
  if (val == null || val === '') return NaN
  return Number(String(val).replace(',', '.').replace(/\s/g, ''))
}

function formatVolNumericDisplay(val) {
  if (val === null || val === undefined || val === '') return ''
  const n = typeof val === 'number' ? val : parseLegacyNumber(val)
  if (Number.isNaN(n)) return ''
  return String(n)
}

/** Port traitementFm1.js — addNMonthToDate(date, n). */
function addNMonthToDateLegacy(dateFr, n) {
  const today = parseLegacyDate(dateFr)
  if (!today) return null
  const shifted = new Date(today.getFullYear(), today.getMonth() + (n + 1), 0)
  shifted.setDate(Math.min(today.getDate(), shifted.getDate()))
  return shifted
}

/** Port traitementFm1.js — takeCarDate(date, p) ; p === '1' → 1er du mois. */
function takeCarDateLegacy(date, firstOfMonth = false) {
  if (!date) return ''
  const year = date.getFullYear()
  let month = String(date.getMonth() + 1)
  let day = String(date.getDate())
  if (month.length === 1) month = `0${month}`
  const monthYear = `${month}/${year}`
  if (firstOfMonth) return `01/${monthYear}`
  if (day.length === 1) day = `0${day}`
  return `${day}/${monthYear}`
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

/**
 * Dates d'affiliation régime 1 — beforerender imma_assure.js (regime === '1').
 * DATE_DEBUT_AFFI = date_effet ou min_date_effet si date_effet antérieure.
 * MIN_DATE_DEBUT_AFFI = 1er jour du mois de addNMonthToDate(DATE_DEBUT_AFFI, -6).
 */
export function computeAffiliationDatesVol(session = {}) {
  const s = normalizeSessionAssureInitRow(session)
  const dateEffetStr = s.date_effet || ''
  const minDateEffetStr = s.min_date_effet || ''
  let dateDebutAffiStr = dateEffetStr
  if (dateEffetStr && minDateEffetStr && compareDates(dateEffetStr, minDateEffetStr) < 0) {
    dateDebutAffiStr = minDateEffetStr
  }
  if (!dateDebutAffiStr) {
    dateDebutAffiStr = formatDateFr()
  }
  const last6 = addNMonthToDateLegacy(dateDebutAffiStr, -6)
  const minDebutAffiStr = last6 ? takeCarDateLegacy(last6, true) : ''
  return {
    DATE_DEBUT_AFFI: dateDebutAffiStr,
    MIN_DATE_DEBUT_AFFI: minDebutAffiStr,
  }
}

function isGererAssureTauxOracleMask(value) {
  const n = parseLegacyNumber(value)
  if (Number.isNaN(n)) return false
  return n === 9.99 || n === 0.99
}

function formatTauxPercentForGererAssure(percent) {
  const n = parseLegacyNumber(percent)
  if (Number.isNaN(n)) return ''
  return n.toFixed(2)
}

/**
 * Taux de cotisation en % (ex. 8.4) — ignore le masque Oracle 9.99/0.99 du champ caché JSP `taux`.
 */
export function resolveVolTauxPercent(source = {}, fallback = '') {
  const candidates = [
    source.TAUX,
    source.TAUX_COTISATION,
    source.taux,
    fallback,
  ]
  for (const raw of candidates) {
    if (raw == null || raw === '') continue
    if (isGererAssureTauxOracleMask(raw)) continue
    const n = parseLegacyNumber(raw)
    if (Number.isNaN(n) || n <= 0) continue
    if (n > 0 && n < 1) return n * 100
    return n
  }
  return ''
}

/** Taux de cotisation figé — JTAUX_COTISATION via tele_imma_assure.jsp (#formAssu). */
export function resolveVolTauxCotisation(session = {}, fallback = '') {
  const p = resolveVolTauxPercent(session, fallback)
  return p === '' ? '' : p
}

/** TAUX = taux % ; taux = masque Oracle — aligné POST GererAssure / tele_imma_assure.jsp. */
export function syncGererAssureTauxVolFields(form) {
  const percent = resolveVolTauxPercent(form)
  form.taux = GERER_ASSURE_TAUX_ORACLE_FORMAT
  if (percent !== '') {
    form.TAUX = formatTauxPercentForGererAssure(percent)
  }
}

/** Applique les paramètres serveur (session) + bornes dates d'affiliation. */
export function applyVolSessionParams(form, session = {}) {
  const s = normalizeSessionAssureInitRow(session)
  const today = formatDateFr()
  const tauxVal = resolveVolTauxCotisation(s, form.TAUX)
  const affDates = computeAffiliationDatesVol(s)
  const maxCot = parseLegacyNumber(s.max_cotisation_annuel)

  form.DATE_DEMANDE = s.date_demande || s.DATE_DEMANDE || today
  form.date_effet = s.date_effet || form.date_effet || ''
  form.min_date_effet = s.min_date_effet || form.min_date_effet || ''
  form.smig_annuel = s.smig_annuel ?? form.smig_annuel ?? ''
  form.max_cotisation_annuel = s.max_cotisation_annuel ?? form.max_cotisation_annuel ?? ''
  if (tauxVal !== '' && tauxVal != null) {
    form.TAUX = formatVolNumericDisplay(tauxVal)
  }
  syncGererAssureTauxVolFields(form)
  form.DATE_DEBUT_AFFI = affDates.DATE_DEBUT_AFFI
  form.MIN_DATE_DEBUT_AFFI = affDates.MIN_DATE_DEBUT_AFFI

  if (!Number.isNaN(maxCot) && maxCot > 0) {
    form._maxCotisationMensuelle = Math.floor(maxCot / 12)
  }
}

export function initImmatAssuVolRegime1(form, session = {}) {
  const s = normalizeSessionAssureInitRow(session)
  const today = formatDateFr()

  Object.assign(form, {
    regime: REGIME_VOLONTAIRE,
    regimeAffi: REGIME_VOLONTAIRE,
    regimeAffiC: 'Volontaire',
    DATE_DEMANDE: s.date_demande || s.DATE_DEMANDE || today,
    date_effet: s.date_effet || '',
    taux: GERER_ASSURE_TAUX_ORACLE_FORMAT,
    min_date_effet: s.min_date_effet || '',
    smig_annuel: s.smig_annuel ?? '',
    max_cotisation_annuel: s.max_cotisation_annuel ?? '',
    TAUX: formatVolNumericDisplay(resolveVolTauxCotisation(s, form.TAUX)),
    DATE_DEBUT_AFFI: '',
    MIN_DATE_DEBUT_AFFI: '',
    code_tele: s.code_tele || s.codeTele || '',
    code_secret: s.code_secret || s.codeSecret || '',
    Dest: s.Dest || '',
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

  applyVolSessionParams(form, s)
}

/** SMIG applicable — selectSmig(lesSmig.jsp) + date d’affiliation sollicitée. */
export function applyVolSmigForAffiliationDate(form, smigLines, dateStr) {
  if (!smigLines?.length || !dateStr) return
  const smig = selectSmig(smigLines, dateStr)
  if (smig) form.SMIG_VALUE = smig
}

/** Repli si lesSmig.jsp indisponible (comportement historique simplifié). */
export function updateSmigFromAffiliationDateFallback(form, dateStr) {
  const d = parseLegacyDate(dateStr)
  if (!d) return
  form.SMIG_VALUE = d.getFullYear() >= 2014 ? 36270 : 28182
}

/**
 * Calcul assiette / cotisation — blur MONTANT_REV_ANNUEL (info_regime_assure.js).
 * assiette = floor(revenu/12), plafonnée au max mensuel, plancher SMIG si besoin.
 * montant = ceil(assiette * TAUX / 100).
 */
export function updateAssietteCotisationVol(form) {
  const revenu = parseLegacyNumber(form.MONTANT_REV_ANNUEL)
  const taux = parseLegacyNumber(form.TAUX)
  const smig = parseLegacyNumber(form.SMIG_VALUE)
  const maxAnnuel = parseLegacyNumber(form.max_cotisation_annuel)
  const maxMensuel =
    form._maxCotisationMensuelle ??
    (!Number.isNaN(maxAnnuel) && maxAnnuel > 0 ? Math.floor(maxAnnuel / 12) : null)

  if (!revenu || Number.isNaN(revenu) || !taux || Number.isNaN(taux)) {
    form.ASSIETTE_COTISATION = ''
    form.MONTANT_COTISATION = ''
    return
  }

  const as = revenu / 12
  let assiette
  if (maxMensuel != null && !Number.isNaN(maxMensuel) && as - maxMensuel >= 0) {
    assiette = Math.floor(maxMensuel)
  } else {
    assiette = Math.floor(as)
    if (!Number.isNaN(smig) && smig > 0 && assiette < smig) {
      assiette = smig
    }
  }

  form.ASSIETTE_COTISATION = formatVolNumericDisplay(assiette)
  form.MONTANT_COTISATION = formatVolNumericDisplay(Math.ceil((assiette * taux) / 100))
}

/** Recalcule le montant — blur ASSIETTE_COTISATION (info_regime_assure.js). */
export function updateMontantCotisationFromAssietteVol(form) {
  const assiette = parseLegacyNumber(form.ASSIETTE_COTISATION)
  const taux = parseLegacyNumber(form.TAUX)
  if (!assiette || Number.isNaN(assiette) || !taux || Number.isNaN(taux)) {
    form.MONTANT_COTISATION = ''
    return
  }
  form.MONTANT_COTISATION = formatVolNumericDisplay(Math.ceil((assiette * taux) / 100))
}

/**
 * Bornes assiette — min SMIG, max plafond mensuel ou floor(revenu/12) si revenu < plafond.
 * @returns {{ min: number|null, max: number|null }}
 */
export function getAssietteCotisationBounds(form = {}) {
  const smig = parseLegacyNumber(form.SMIG_VALUE)
  const min = !Number.isNaN(smig) && smig > 0 ? smig : null

  const maxAnnuel = parseLegacyNumber(form.max_cotisation_annuel)
  const maxMensuelPlafond =
    form._maxCotisationMensuelle ??
    (!Number.isNaN(maxAnnuel) && maxAnnuel > 0 ? Math.floor(maxAnnuel / 12) : null)

  const revenu = parseLegacyNumber(form.MONTANT_REV_ANNUEL)
  let max = maxMensuelPlafond

  if (revenu && !Number.isNaN(revenu)) {
    const as = revenu / 12
    if (
      maxMensuelPlafond != null &&
      !Number.isNaN(maxMensuelPlafond) &&
      as - maxMensuelPlafond >= 0
    ) {
      max = Math.floor(maxMensuelPlafond)
    } else {
      const floorAs = Math.floor(as)
      if (min != null && floorAs > min) {
        max = floorAs
      } else if (max == null && floorAs > 0) {
        max = floorAs
      }
    }
  }

  return { min, max }
}

/** Normalise une date q-date (YYYY/MM/DD) vers jj/mm/aaaa pour compareDates. */
export function normalizeQDateForLegacyCompare(dateStr) {
  if (!dateStr) return dateStr
  const parts = String(dateStr).split('/')
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

/**
 * Validations métier régime 1 — erreurs par nom de champ (affichage immédiat).
 * @returns {{ field: string, message: string }[]}
 */
export function collectRegime1ValidationErrors(form, step = null) {
  const errors = []
  const push = (field, message) => errors.push({ field, message })

  syncOrigineHidden(form)
  collectImmatPersonValidationErrors(form, step, push)

  const checkAll = step === null || step === 7
  const check1 = step === null || step === 1

  if (check1 || checkAll) {
    if (!form.CODE_ORIGINEREV) {
      push('ORIGINE_REVENU', "Veuillez choisir l'origine des revenus.")
    }
    if (!String(form.DETAILS_ORIGINEREV || '').trim()) {
      push('DETAILS_ORIGINEREV', "Veuillez préciser les détails sur l'origine des revenus.")
    }
    if (!form.DATE_DEBUT_AFFI_SOLL) {
      push('DATE_DEBUT_AFFI_SOLL', "La date d'affiliation sollicitée est obligatoire.")
    } else if (form.MIN_DATE_DEBUT_AFFI && form.DATE_DEBUT_AFFI) {
      if (compareDates(form.DATE_DEBUT_AFFI_SOLL, form.MIN_DATE_DEBUT_AFFI) < 0) {
        push(
          'DATE_DEBUT_AFFI_SOLL',
          "La date d'affiliation sollicitée est antérieure à la date minimum autorisée.",
        )
      } else if (compareDates(form.DATE_DEBUT_AFFI_SOLL, form.DATE_DEBUT_AFFI) > 0) {
        push(
          'DATE_DEBUT_AFFI_SOLL',
          "La date d'affiliation sollicitée est postérieure à la date d'affiliation normale.",
        )
      }
    }
    const rev = String(form.MONTANT_REV_ANNUEL ?? '').trim()
    if (!rev) {
      push('MONTANT_REV_ANNUEL', 'Le revenu annuel est obligatoire.')
    } else if (!REVENU_REGEX.test(rev)) {
      push('MONTANT_REV_ANNUEL', 'Le revenu annuel doit comporter entre 5 et 10 chiffres.')
    }
    const assietteStr = String(form.ASSIETTE_COTISATION ?? '').trim()
    if (!assietteStr) {
      push('ASSIETTE_COTISATION', "L'assiette de cotisation est obligatoire.")
    } else if (!REVENU_REGEX.test(assietteStr)) {
      push('ASSIETTE_COTISATION', "L'assiette de cotisation doit comporter entre 5 et 10 chiffres.")
    } else {
      const assiette = Number(form.ASSIETTE_COTISATION)
      const { min, max } = getAssietteCotisationBounds(form)
      if (!Number.isNaN(assiette) && min != null && assiette < min) {
        push('ASSIETTE_COTISATION', `L'assiette de cotisation est inférieure au SMIG (${min} F CFA).`)
      } else if (!Number.isNaN(assiette) && max != null && assiette > max) {
        push('ASSIETTE_COTISATION', "L'assiette de cotisation est supérieure au maximum autorisé.")
      }
    }
    if (!form.file504) {
      push('file504', 'La déclaration annuelle de revenu est obligatoire.')
    } else if (!isLegacyImageFile(form.file504)) {
      push('file504', 'La déclaration annuelle de revenu doit être une image (gif, jpeg, jpg, png) ou un PDF.')
    }
    if (!form.file507) {
      push('file507', "La déclaration sur l'honneur (non salarié) est obligatoire.")
    } else if (!isLegacyImageFile(form.file507)) {
      push('file507', "La déclaration sur l'honneur doit être une image (gif, jpeg, jpg, png) ou un PDF.")
    }
    if (
      form.DATE_DEBUT_AFFI &&
      form.DATE_NAISS_PERS &&
      monthsBetween(form.DATE_DEBUT_AFFI, form.DATE_NAISS_PERS) < 12 * 14
    ) {
      push('DATE_DEBUT_AFFI_SOLL', 'Vous avez moins de 14 ans à la date début affiliation.')
    }
  }

  return errors
}

/** @returns {Record<string, string>} */
export function validateRegime1BusinessFieldMap(form, step = null) {
  const map = {}
  for (const { field, message } of collectRegime1ValidationErrors(form, step)) {
    if (!map[field]) map[field] = message
  }
  return map
}

export function validateRegime1Business(form, step = null) {
  const errors = collectRegime1ValidationErrors(form, step)
  return errors[0]?.message ?? null
}

export function buildLegacyFormDataVol(form, options = {}) {
  syncOrigineHidden(form)
  syncLegacyHiddenFields(form)
  syncGererAssureTauxVolFields(form)

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
  const centreObj =
    f.CODE_CENTRECNPSC && typeof f.CODE_CENTRECNPSC === 'object' ? f.CODE_CENTRECNPSC : null
  const centreCodeVal = centreObj?.CODE_CENTRE || f.CODE_CENTRECNPS || ''
  f.codeCentrePrefText = centreCodeVal
  f.CODE_CENTRECNPS = centreCodeVal
  f.CODE_CENTRECNPSC = centreObj?.LIB_CENTRE || ''
  f.TEL_PERS = legacyPhoneDigits(f.TEL_PERS)
  f.FAX_PERS = legacyPhoneDigits(f.FAX_PERS)
  f.BP = legacyBpDigits(f.BP)

  if (options.submissionType === 'temporary') f.valider = 'NON'
  else if (options.submissionType === 'definitive') f.valider = 'OUI'

  LEGACY_VOL_TEXT_FIELDS.forEach((key) => appendLegacyFormField(fd, key, f[key]))
  appendLegacyFormField(fd, 'codeCentrePrefText', f.codeCentrePrefText)

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
