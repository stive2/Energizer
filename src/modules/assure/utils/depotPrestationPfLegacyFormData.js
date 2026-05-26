/**
 * Construction du FormData multipart aligné sur tele_prestation_pf.jsp /
 * tele_prestation_pf.js (POST ../Choix_prestation_pf).
 */
import { centres } from 'src/modules/shared/data/Centres.js'
import { DEPOT_PF_TYPE_CODES } from 'src/modules/assure/data/depotPrestationPfTypes.js'
import { syncAllocationsPieces } from 'src/modules/assure/utils/depotPrestationPfAccouchement.js'

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

/** Champs communs ExtJS — exclus de la boucle « specific ». */
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

/**
 * Cases à cocher ExtJS : valeur envoyée lorsque cochée.
 * @param {FormData} fd
 * @param {string} key
 * @param {boolean} checked
 */
function appendCheckbox(fd, key, checked) {
  if (checked) {
    fd.append(key, 'on')
  }
}

/**
 * @param {FormData} fd
 * @param {Record<string, unknown>} form
 * @param {Set<string>} [skipKeys]
 */
function appendLegacyFormFields(fd, form, skipKeys = new Set()) {
  for (const [key, val] of Object.entries(form)) {
    if (skipKeys.has(key) || COMMON_FORM_KEYS.has(key)) continue
    if (val instanceof File) {
      fd.append(key, val, val.name)
    } else if (typeof val === 'boolean') {
      appendCheckbox(fd, key, val)
    } else {
      appendScalar(fd, key, val)
    }
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
  const num = String(numAssu || '').trim()
  if (!num) return ''
  return `DestFichAssu/${num.replace(/-/g, '_')}/pf/`
}

/**
 * @param {import('pinia').Store} store — useDepotPrestationPfStore
 * @param {string} typeCode — DEPOT_PF_TYPE_CODES.*
 * @returns {FormData}
 */
export function buildDepotPrestationPfLegacyFormData(store, typeCode) {
  const fd = new FormData()
  const ctx = store.contexte || {}
  const common = store.getCommonForSubmit()
  const flags = TYPE_CODE_TO_LEGACY_FLAGS[typeCode] || {}
  const numAssu = store.numAssu || ctx.numAssu || ''

  appendScalar(fd, 'numAssu', numAssu)
  appendScalar(fd, 'codeSecret', ctx.codeSecret || ctx.codeSecrText || '')
  appendScalar(fd, 'choixAp', flags.choixAp ?? '0')
  appendScalar(fd, 'choixAc', flags.choixAc ?? '0')
  appendScalar(fd, 'choixIjcm', flags.choixIjcm ?? '0')
  appendScalar(fd, 'choixAf', flags.choixAf ?? '0')

  const nomComplet = [ctx.nom, ctx.prenom].filter(Boolean).join(' ').trim()
  appendScalar(fd, 'numAssuText', numAssu)
  appendScalar(fd, 'laction', ctx.laction || 'Créer')
  appendScalar(fd, 'nomAssuText', nomComplet || ctx.nomAssuText || '')
  appendScalar(fd, 'dateNaissAssuText', ctx.dateNaissance || ctx.dateNaissAssuText || '')
  appendScalar(fd, 'sexeAssuText', formatSexeAssuText(ctx.sexe || ctx.sexeAssuText))
  appendScalar(fd, 'addrAssuText', common.addrAssuText || '')
  appendScalar(fd, 'emailAssuText', common.emailAssuText || '')
  appendScalar(fd, 'telAssuText', common.telAssuText || '')
  appendScalar(fd, 'matrInteText', common.matrInteText || '')
  appendScalar(fd, 'matEmployeur', common.matEmployeur || '')
  appendScalar(fd, 'RAISON_SOCIALE', common.RAISON_SOCIALE || '')

  const centreFields = resolveCentreFields(common)
  appendScalar(fd, 'codeCentrePrefText', centreFields.codeCentrePrefText)
  appendScalar(fd, 'CODE_CENTRECNPSC', centreFields.CODE_CENTRECNPSC)
  appendScalar(fd, 'Dest', buildDestPath(numAssu, ctx.Dest))

  appendScalar(fd, 'typePrestation', flags.typePrestation || '')
  appendScalar(fd, 'codeSecrText', ctx.codeSecrText || ctx.codeSecret || '')
  appendScalar(fd, 'numDossier', ctx.numDossier || '')
  appendScalar(fd, 'dateCreaDoss', ctx.dateCreaDoss || '')
  appendScalar(fd, 'simples', 'simples')

  if (common.typeSubmission === 'temporaire') {
    appendScalar(fd, 'valider', 'NON')
  } else if (common.typeSubmission === 'definitive') {
    appendScalar(fd, 'valider', 'OUI')
  }

  if (typeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
    appendLegacyFormFields(fd, store.examensPrenataux)
  } else if (typeCode === DEPOT_PF_TYPE_CODES.ACCOUCHEMENT) {
    appendLegacyFormFields(fd, store.accouchement)
  } else if (typeCode === DEPOT_PF_TYPE_CODES.CONGES_MATERNITE) {
    appendLegacyFormFields(fd, store.congesMaternite)
  } else if (typeCode === DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES) {
    syncAllocationsPieces(store.allocations)
    appendLegacyFormFields(fd, store.allocations)
  }

  return fd
}
