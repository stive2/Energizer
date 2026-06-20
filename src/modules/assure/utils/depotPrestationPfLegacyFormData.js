/**
 * Construction du FormData multipart aligné sur tele_prestation_pf.jsp /
 * tele_prestation_pf.js (POST ../Choix_prestation_pf).
 *
 * Soumission directe servlet Choix_prestation_pf (teleImmat_0.1, proxy /tele-immat).
 * Le servlet teleImmat n'est pas modifié : soumission via query-string (scalaires)
 * + multipart fichiers seuls (PfServletProxy / contournement Tomcat @MultipartConfig).
 */
import { centres } from 'src/modules/shared/data/Centres.js'
import { buildTeleImmatPfUploadDest } from 'src/modules/shared/config/teleImmat.js'
import { DEPOT_PF_TYPE_CODES } from 'src/modules/assure/data/depotPrestationPfTypes.js'
import {
  acteNaissanceKey,
  parseNombreEnfantsSousControleAccouchement,
  syncAllocationsPieces,
} from 'src/modules/assure/utils/depotPrestationPfAccouchement.js'
import { formatTodayFr } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { PF_LACTION_CREATE } from 'src/modules/assure/utils/pfServletSubmit.js'
import { PF_PIECE } from 'src/modules/assure/data/depotPrestationPfLegacyFields.js'

/** @type {Record<string, { typePrestation: string, choixAp: string, choixAc: string, choixIjcm: string, choixAf: string }>} */
const TYPE_CODE_TO_LEGACY_FLAGS = {
  [DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX]: {
    typePrestation: 'AP',
    choixAp: '1',
    choixAc: '0',
    choixIjcm: '0',
    choixAf: '0',
  },
  [DEPOT_PF_TYPE_CODES.ACCOUCHEMENT]: {
    typePrestation: 'FA',
    choixAp: '0',
    choixAc: '1',
    choixIjcm: '0',
    choixAf: '0',
  },
  [DEPOT_PF_TYPE_CODES.CONGES_MATERNITE]: {
    typePrestation: 'IJ',
    choixAp: '0',
    choixAc: '0',
    choixIjcm: '1',
    choixAf: '0',
  },
  [DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES]: {
    typePrestation: 'AF',
    choixAp: '0',
    choixAc: '0',
    choixIjcm: '0',
    choixAf: '1',
  },
}

const COMMON_FORM_KEYS = new Set([
  'matEmployeur',
  'RAISON_SOCIALE',
  'matrInteText',
  'emailAssuText',
  'telAssuText',
  'addrAssuText',
  'CODE_CENTRECNPSC',
  'CODE_CENTRECNPS',
  'typeSubmission',
])

function formatSexeAssuText(sexe) {
  const s = String(sexe || '').toUpperCase()
  if (s === 'F' || s === 'FEMININ' || s === 'FÉMININ') return 'FEMININ'
  if (s === 'M' || s === 'MASCULIN') return 'MASCULIN'
  return s
}

function appendScalar(fd, key, value) {
  if (value === null || value === undefined || value === '') return
  fd.append(key, String(value))
}

/** Toujours envoyer (le servlet legacy attend « 0 » / « 1 », pas l’absence du champ). */
function appendScalarAlways(fd, key, value) {
  fd.append(key, value === null || value === undefined ? '' : String(value))
}

function appendCheckbox(fd, key, checked) {
  if (checked) fd.append(key, 'on')
}

/**
 * @param {FormData} fd
 * @param {Array<[string, unknown]>} entries
 */
function appendOrderedScalars(fd, entries) {
  for (const [key, value] of entries) {
    if (value === null || value === undefined || value === '') continue
    if (typeof value === 'boolean') {
      appendCheckbox(fd, key, value)
    } else {
      fd.append(key, String(value))
    }
  }
}

/**
 * @param {FormData} fd
 * @param {Record<string, unknown>} form
 * @param {Set<string>} [skipKeys]
 */
function appendLegacyFormFields(fd, form, skipKeys = new Set()) {
  const fileEntries = []
  for (const [key, val] of Object.entries(form)) {
    if (skipKeys.has(key) || COMMON_FORM_KEYS.has(key)) continue
    if (val instanceof File) {
      fileEntries.push([key, val])
    } else if (typeof val === 'boolean') {
      appendCheckbox(fd, key, val)
    } else {
      appendScalar(fd, key, val)
    }
  }
  for (const [key, file] of fileEntries) {
    fd.append(key, file, file.name)
  }
}

function resolveCentreFields(common) {
  const code = common.CODE_CENTRECNPSC ?? common.CODE_CENTRECNPS ?? ''
  const centre = centres.find((c) => String(c.CODE_CENTRE) === String(code))
  if (centre) {
    return {
      codeCentrePrefText: centre.CODE_CENTRE,
      CODE_CENTRECNPSC: centre.LIB_CENTRE,
    }
  }
  return {
    codeCentrePrefText: code || '',
    CODE_CENTRECNPSC: code || '',
  }
}

function buildDestPath(numAssu, ctxDest) {
  if (ctxDest) return ctxDest
  return buildTeleImmatPfUploadDest(numAssu)
}

function appendCommonServletFields(fd, store, typeCode) {
  const ctx = store.contexte || {}
  const common = store.getCommonForSubmit()
  const flags = TYPE_CODE_TO_LEGACY_FLAGS[typeCode] || {}
  const numAssu = store.numAssu || ctx.numAssu || ''
  const nomAssuText =
    String(ctx.nomAssuText || '')
      .trim()
      .replace(/^\.+\s*/, '') ||
    [ctx.nom, ctx.prenom].filter(Boolean).join(' ').trim()
  const centreFields = resolveCentreFields(common)

  appendOrderedScalars(fd, [
    ['numAssuText', numAssu],
    ['laction', PF_LACTION_CREATE],
    ['sexeAssuText', formatSexeAssuText(ctx.sexe || ctx.sexeAssuText)],
    ['addrAssuText', common.addrAssuText || ''],
    ['emailAssuText', common.emailAssuText || ''],
    ['telAssuText', common.telAssuText || ''],
    ['matrInteText', common.matrInteText || ''],
    ['matEmployeur', common.matEmployeur || ''],
    ['RAISON_SOCIALE', common.RAISON_SOCIALE || ''],
  ])

  appendScalarAlways(fd, 'nomAssuText', nomAssuText || numAssu)
  appendScalarAlways(fd, 'dateNaissAssuText', ctx.dateNaissance || ctx.dateNaissAssuText || '')
  appendScalarAlways(fd, 'numDossier', ctx.numDossier || '')

  const isExistingDossier = Boolean(String(ctx.numDossier || '').trim())
  if (isExistingDossier) {
    appendScalarAlways(fd, 'codeSecrText', ctx.codeSecrText || ctx.codeSecret || '')
  }

  appendScalarAlways(fd, 'dateCreaDoss', ctx.dateCreaDoss || formatTodayFr())

  appendOrderedScalars(fd, [
    ['typePrestation', flags.typePrestation || ''],
    ['codeCentrePrefText', centreFields.codeCentrePrefText],
    ['CODE_CENTRECNPSC', centreFields.CODE_CENTRECNPSC],
    ['Dest', buildDestPath(numAssu, ctx.Dest)],
    ['numAssu', numAssu],
    ['choixAp', flags.choixAp ?? '0'],
    ['choixAc', flags.choixAc ?? '0'],
    ['choixIjcm', flags.choixIjcm ?? '0'],
    ['choixAf', flags.choixAf ?? '0'],
  ])

  if (isExistingDossier) {
    appendOrderedScalars(fd, [
      ['codeSecret', ctx.codeSecret || ctx.codeSecrText || ''],
      ['code_secret', ctx.codeSecrText || ctx.codeSecret || ''],
      ['code_tele', ctx.numDossier || ctx.code_tele || ''],
    ])
  }

  return { common, flags, numAssu }
}

function appendExamensPrenatauxFields(fd, store) {
  const form = store.examensPrenataux
  const choice = store.examensPrenatauxChoice || 'both'
  const includePremier = choice !== 'deuxieme'
  const includeDeuxieme = choice !== 'premier'

  // GererPrestationPf lit ces dates sans garde null lorsque choixAp=1 (ExtJS envoie toujours les champs).
  appendScalarAlways(
    fd,
    'dateExam1Date',
    includePremier ? form.dateExam1Date || '' : '',
  )
  appendScalarAlways(fd, 'dateExam2', includeDeuxieme ? form.dateExam2 || '' : '')
  appendScalarAlways(fd, 'dateAccoProb', includeDeuxieme ? form.dateAccoProb || '' : '')

  if (includePremier) {
    appendCheckbox(fd, 'AP1ChBo', form.AP1ChBo)
    appendCheckbox(fd, 'FM1ChBo', form.FM1ChBo)
  }
  if (includeDeuxieme) {
    appendCheckbox(fd, 'AP2ChBo', form.AP2ChBo)
    appendCheckbox(fd, 'FM2ChBo', form.FM2ChBo)
  }

  const pushFile = (key) => {
    const file = form[key]
    if (file instanceof File) fd.append(key, file, file.name)
  }

  if (includePremier) {
    pushFile(PF_PIECE.CERT_AP1)
    if (form.FM1ChBo) pushFile(PF_PIECE.FRAIS_AP1)
  }
  if (includeDeuxieme) {
    pushFile(PF_PIECE.CERT_AP2)
    if (form.FM2ChBo) pushFile(PF_PIECE.FRAIS_AP2)
  }
}

function appendCongesMaterniteScalars(fd, form) {
  const nombJourSupp =
    form.nombJourSupp === null || form.nombJourSupp === undefined || form.nombJourSupp === ''
      ? '0'
      : String(form.nombJourSupp)
  const nombEnfaViab =
    form.nombEnfaViab === null || form.nombEnfaViab === undefined || form.nombEnfaViab === ''
      ? '1'
      : String(form.nombEnfaViab)
  const nombEnfaContMedi =
    form.nombEnfaContMedi === null ||
    form.nombEnfaContMedi === undefined ||
    form.nombEnfaContMedi === ''
      ? ''
      : String(form.nombEnfaContMedi)
  const dateAccoEffe = form.dateAccoEffe || form.dateDebuCongEffe || ''

  if (form.ijcmChBo !== false) {
    fd.append('ijcmChBo', 'on')
  }
  if (form.accoPremChBo) {
    fd.append('accoPremChBo', 'on')
  }

  appendScalarAlways(fd, 'nombJourSupp', nombJourSupp)
  appendScalar(fd, 'dateDebuCongEffe', form.dateDebuCongEffe)
  appendScalar(fd, 'dateFinCongEffe', form.dateFinCongEffe)
  appendScalar(fd, 'dateDebuNonSala', form.dateDebuNonSala)
  appendScalar(fd, 'dateFinNonSala', form.dateFinNonSala)
  appendScalar(fd, 'dateReprActi', form.dateReprActi)
  appendScalar(fd, 'dateAccoEffe', dateAccoEffe)
  appendScalarAlways(fd, 'nombEnfaViab', nombEnfaViab)
  appendScalar(fd, 'nombEnfaContMedi', nombEnfaContMedi)
}

function appendCongesMaterniteFiles(fd, form) {
  const files = []

  const pushFile = (key) => {
    const file = form[key]
    if (file instanceof File) files.push([key, file])
  }

  pushFile(PF_PIECE.CERT_ACCOUCHEMENT)
  pushFile(PF_PIECE.BULLETIN_PAIE)
  pushFile(PF_PIECE.ATTESTATION_CESSATION)

  const count = parseNombreEnfantsSousControleAccouchement(form.nombEnfaContMedi)
  for (let i = 1; i <= count; i += 1) {
    pushFile(acteNaissanceKey(i))
  }

  for (const [key, file] of files) {
    fd.append(key, file, file.name)
  }
}

/**
 * @param {import('pinia').Store} store
 * @param {string} typeCode
 * @returns {FormData}
 */
export function buildDepotPrestationPfLegacyFormData(store, typeCode) {
  const fd = new FormData()
  appendCommonServletFields(fd, store, typeCode)

  if (typeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
    appendExamensPrenatauxFields(fd, store)
  } else if (typeCode === DEPOT_PF_TYPE_CODES.ACCOUCHEMENT) {
    appendLegacyFormFields(fd, store.accouchement)
  } else if (typeCode === DEPOT_PF_TYPE_CODES.CONGES_MATERNITE) {
    const form = store.congesMaternite
    appendCongesMaterniteScalars(fd, form)
    appendCongesMaterniteFiles(fd, form)
  } else if (typeCode === DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES) {
    syncAllocationsPieces(store.allocations)
    appendLegacyFormFields(fd, store.allocations)
  }

  return fd
}
