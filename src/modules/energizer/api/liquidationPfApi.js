import { api } from 'src/modules/shared/services/http/cnpsHttp.js'
import { energizerAxios } from 'src/modules/shared/api/auth/energizerClient.js'
import { isEnergizerLegacyAuthEnabled } from 'src/modules/shared/config/energizerHttp.js'
import { getEnergizerBaseUrl } from 'src/modules/shared/config/energizerHttp.js'

import { ENERGIZER_API } from './paths.js'

import { callApi, unwrapData } from './callApi.js'

import {

  LegacyOperation,

  toLegacyApiPayload,

} from './adapters/energizerLegacyAdapter.js'

import {
  formatLegacyServerMessage,
  isLegacyNouveauDossierSuccessMessage,
  parseLegacyRedirectError,
} from './adapters/parseNouveauDossierLegacyHtml.js'

import {
  buildPfElementsLiquidationApiPayload,
  buildPfAllocationFamilialeApiPayload,
  buildPfRepriseApiPayload,
  buildPfRepriseDeleteApiPayload,
  buildPfPeriodeActiviteApiPayload,
  buildPfPmdApiPayload,
  PF_ELEMENTS_LIQUIDATION_SUBMIT_FIELDS,
  PF_AF_SUBMIT_FIELDS,
  PF_REPRISE_SUBMIT_FIELDS,
  PF_REPRISE_DELETE_FIELDS,
  PF_PERIODE_SUBMIT_FIELDS,
  PF_PMD_SUBMIT_FIELDS,
} from '../data/liquidationPfLegacyFields.js'

import {
  ENERGIZER_LEGACY_JSP,
  ENERGIZER_LEGACY_SERVLETS,
  postEnergizerLegacyServlet,
} from './energizerLegacyClient.js'

import {
  parseLegacyLoadingRowsFromHtml,
  mapLegacyPeriodeLoadingArgs,
  mapLegacyPmdLoadingArgs,
  parseStatSituationsFromHtml,
  parseStatCentresFromHtml,
} from './pfLegacyHtmlParsers.js'
import { isEnergizerLegacyLoginPageHtml } from 'src/modules/energizer/utils/energizerLegacySessionDetect.js'
import { createEnergizerSessionExpiredError } from 'src/modules/energizer/utils/energizerSessionExpiry.js'

function legacyPfLiquidationRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.elementsLiquidationPF}`
}

function legacyAfLiquidationRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.elementsLiquidationAF}`
}

function legacyReprisesRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.gestionDesReprises}`
}

function legacyPeriodeRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.periodeActivite}`
}

function legacyPmdRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.gestionPieceMaintientDroit}`
}

function legacyPagePrincipaleRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.pagePrincipale}`
}

function legacyStatRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.statSituationsDossiersParBranche}`
}

/**
 * @param {Record<string, string>} payload
 * @param {readonly string[]} fieldNames
 */
function fillLegacySubmitFields(payload, fieldNames) {
  /** @type {Record<string, string>} */
  const out = { ...payload }
  fieldNames.forEach((key) => {
    if (out[key] == null) out[key] = ''
  })
  return out
}

/**
 * @param {{ error?: string | null, finalUrl?: string | null, redirectUrl?: string | null }} response
 * @returns {string | null}
 */
function extractLegacyPfServerMessage(response) {
  const raw =
    response?.error ||
    parseLegacyRedirectError(response?.finalUrl) ||
    parseLegacyRedirectError(response?.redirectUrl) ||
    null
  return raw ? formatLegacyServerMessage(raw) : null
}

/**
 * @param {Record<string, unknown>} form
 * @param {{ servlet: string, referer: string, buildPayload: (form: Record<string, unknown>) => Record<string, string>, fields: readonly string[] }} config
 */
async function submitPfLiquidationLegacy(form, config) {
  const payload = fillLegacySubmitFields(config.buildPayload(form), config.fields)
  if (config.submitButton) payload[config.submitButton] = config.submitButtonValue ?? 'Valider'

  const response = await postEnergizerLegacyServlet(config.servlet, payload, {
    referer: config.referer,
  })

  const serverMessage = extractLegacyPfServerMessage(response)

  if (serverMessage && !isLegacyNouveauDossierSuccessMessage(serverMessage)) {
    throw new Error(serverMessage)
  }

  if (!serverMessage) {
    throw new Error('Réponse serveur inattendue après enregistrement.')
  }

  return { success: true, message: serverMessage }
}

function parseLegacyJsArgList(rawArgs) {
  const args = []
  let current = ''
  let inQuote = false
  let quoteChar = ''

  for (let i = 0; i < rawArgs.length; i += 1) {
    const ch = rawArgs[i]
    if ((ch === "'" || ch === '"') && rawArgs[i - 1] !== '\\') {
      if (!inQuote) {
        inQuote = true
        quoteChar = ch
      } else if (quoteChar === ch) {
        inQuote = false
        quoteChar = ''
      }
      current += ch
      continue
    }

    if (ch === ',' && !inQuote) {
      args.push(current.trim())
      current = ''
      continue
    }

    current += ch
  }
  if (current.trim().length > 0) args.push(current.trim())
  return args
}

function normalizeLegacyJsValue(v) {
  const raw = String(v ?? '').trim()
  if (!raw || raw === 'null' || raw === 'undefined' || raw === 'this') return ''
  if (
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith('"') && raw.endsWith('"'))
  ) {
    return raw.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').trim()
  }
  return raw
}

function mapLegacyAfLoadingArgs(args) {
  if (args.length < 8) return null
  return {
    numdoss: normalizeLegacyJsValue(args[0]),
    numassu: normalizeLegacyJsValue(args[1]),
    datedemande: normalizeLegacyJsValue(args[2]),
    natupres: normalizeLegacyJsValue(args[3]),
    position: normalizeLegacyJsValue(args[4]),
    dateposi: normalizeLegacyJsValue(args[5]),
    nomassu: normalizeLegacyJsValue(args[6]),
    prenomassu: normalizeLegacyJsValue(args[7]),
    dateembauche: normalizeLegacyJsValue(args[8]),
    datesignempl: normalizeLegacyJsValue(args[9]),
    nbreheure: normalizeLegacyJsValue(args[10]),
    libellenatupres: normalizeLegacyJsValue(args[11]),
    sexe: normalizeLegacyJsValue(args[12]),
    requerant: normalizeLegacyJsValue(args[13]),
  }
}

function mapLegacyReprisesLoadingArgs(args) {
  if (args.length < 14) return null
  const flag = normalizeLegacyJsValue(args[13])
  return {
    numdoss: normalizeLegacyJsValue(args[0]),
    numassu: normalizeLegacyJsValue(args[1]),
    datedemande: normalizeLegacyJsValue(args[2]),
    natupres: normalizeLegacyJsValue(args[3]),
    position: normalizeLegacyJsValue(args[4]),
    dateposi: normalizeLegacyJsValue(args[5]),
    nomassu: normalizeLegacyJsValue(args[6]),
    prenomassu: normalizeLegacyJsValue(args[7]),
    libellenatupres: normalizeLegacyJsValue(args[8]),
    requerant: normalizeLegacyJsValue(args[10]) || normalizeLegacyJsValue(args[9]),
    datedebut: normalizeLegacyJsValue(args[11]),
    datefin: normalizeLegacyJsValue(args[12]),
    flagreprise: flag,
    cbxtype: flag,
    jourspayes: normalizeLegacyJsValue(args[14]),
    joursreliquat: normalizeLegacyJsValue(args[15]),
    rang: normalizeLegacyJsValue(args[16]),
    cbxrang: normalizeLegacyJsValue(args[16]),
    flagrembempl: normalizeLegacyJsValue(args[17]),
    cbxrembempl: normalizeLegacyJsValue(args[17]),
    numempl: normalizeLegacyJsValue(args[18]),
    datedebrempl: normalizeLegacyJsValue(args[19]),
    datefinrempl: normalizeLegacyJsValue(args[20]),
  }
}

function mapLegacyPfLoadingArgs(args) {
  if (args.length < 10) return null
  return {
    numdoss: normalizeLegacyJsValue(args[0]),
    numassu: normalizeLegacyJsValue(args[1]),
    requerant: normalizeLegacyJsValue(args[2]),
    datedemande: normalizeLegacyJsValue(args[3]),
    natupres: normalizeLegacyJsValue(args[4]),
    position: normalizeLegacyJsValue(args[5]),
    dateposi: normalizeLegacyJsValue(args[6]),
    datedebgross: normalizeLegacyJsValue(args[7]),
    datepreacc: normalizeLegacyJsValue(args[8]),
    dateeffacc: normalizeLegacyJsValue(args[9]),
    datedebconges: normalizeLegacyJsValue(args[10]),
    ap1: normalizeLegacyJsValue(args[11]),
    fm1: normalizeLegacyJsValue(args[12]),
    dateexamen1: normalizeLegacyJsValue(args[13]),
    ap2: normalizeLegacyJsValue(args[14]),
    fm2: normalizeLegacyJsValue(args[15]),
    dateexamen2: normalizeLegacyJsValue(args[16]),
    acc: normalizeLegacyJsValue(args[17]),
    nbreenfvia: normalizeLegacyJsValue(args[18]),
    nbreviabsoucont: normalizeLegacyJsValue(args[19]),
    ij: normalizeLegacyJsValue(args[20]),
    nbreij: normalizeLegacyJsValue(args[21]),
    nbrejrcouche: normalizeLegacyJsValue(args[22]),
    nomassu: normalizeLegacyJsValue(args[23]),
    prenomassu: normalizeLegacyJsValue(args[24]),
    basecal: normalizeLegacyJsValue(args[25]),
    sexe: normalizeLegacyJsValue(args[26]),
    datefinconge: normalizeLegacyJsValue(args[27]),
    numemployeur: normalizeLegacyJsValue(args[28]),
    datedebcesspaie: normalizeLegacyJsValue(args[29]),
    datefincesspaie: normalizeLegacyJsValue(args[30]),
    dateprevfincong: normalizeLegacyJsValue(args[31]),
    accprema: normalizeLegacyJsValue(args[32]),
    datecessaactivite: normalizeLegacyJsValue(args[33]),
    dateprobjouiss: normalizeLegacyJsValue(args[34]),
    datereprise: normalizeLegacyJsValue(args[35]),
    fmacc: normalizeLegacyJsValue(args[36]),
    salreconstitue: normalizeLegacyJsValue(args[37]),
    matriculeinterne: normalizeLegacyJsValue(args[38]),
  }
}

function parsePfDossiersFromElementsLiquidationHtml(html, mapRow = mapLegacyPfLoadingArgs) {
  const raw = String(html ?? '')
  if (!raw.trim()) return []
  if (isEnergizerLegacyLoginPageHtml(raw)) {
    throw createEnergizerSessionExpiredError()
  }

  const rows = []
  const seen = new Set()
  const loadingRe = /javascript:loading\(([^"]+)\)/gi
  let match
  while ((match = loadingRe.exec(raw)) !== null) {
    const args = parseLegacyJsArgList(match[1])
    const row = mapRow(args)
    if (!row?.numdoss) continue
    const key = `${row.numdoss}|${row.numassu}|${row.dateposi}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push(row)
  }
  return rows
}

async function listPeriodesLegacy(params = {}) {
  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })
  const { data } = await energizerAxios.get(ENERGIZER_LEGACY_JSP.periodeActivite, {
    params: legacyParams,
    responseType: 'text',
    skipErrorNotify: true,
  })
  return parseLegacyLoadingRowsFromHtml(data, mapLegacyPeriodeLoadingArgs)
}

async function listPmdLegacy(params = {}) {
  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })
  const { data } = await energizerAxios.get(ENERGIZER_LEGACY_JSP.gestionPieceMaintientDroit, {
    params: { _dc: Date.now(), ...legacyParams },
    responseType: 'text',
    headers: { Referer: legacyPagePrincipaleRefererUrl() },
    skipErrorNotify: true,
    skipSessionExpiryCheck: true,
  })
  return parseLegacyLoadingRowsFromHtml(data, mapLegacyPmdLoadingArgs)
}

async function searchStatistiquesLegacy(filters = {}) {
  const payload = toLegacyApiPayload(LegacyOperation.PF_STATISTIQUES, filters)
  const { data } = await energizerAxios.post(ENERGIZER_LEGACY_JSP.statSituationsDossiersParBranche, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: legacyStatRefererUrl(),
    },
    responseType: 'text',
    skipErrorNotify: true,
  })
  return parseStatSituationsFromHtml(data)
}

/** Chargement initial statSituationsDossiersParBranche.jsp (GET, comme l’affichage JSP au 1er chargement). */
export async function loadPfStatSituationsPage() {
  if (isEnergizerLegacyAuthEnabled()) {
    const { data } = await energizerAxios.get(ENERGIZER_LEGACY_JSP.statSituationsDossiersParBranche, {
      responseType: 'text',
      skipErrorNotify: true,
    })
    return {
      centres: parseStatCentresFromHtml(data),
      dossiers: parseStatSituationsFromHtml(data),
    }
  }

  const dossiers = await searchStatistiquesSituations({
    cbxcentre: '',
    cbxbranche: '',
    txtvaleurdeb: '',
    txtvaleurfin: '',
  })
  return {
    centres: [],
    dossiers: Array.isArray(dossiers) ? dossiers : [],
  }
}

export async function listPfStatCentres() {
  const { centres } = await loadPfStatSituationsPage()
  return centres
}

async function listReprisesLegacy(params = {}) {
  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })
  const { data } = await energizerAxios.get(ENERGIZER_LEGACY_JSP.gestionDesReprises, {
    params: legacyParams,
    responseType: 'text',
    skipErrorNotify: true,
  })
  return parsePfDossiersFromElementsLiquidationHtml(data, mapLegacyReprisesLoadingArgs)
}

async function searchPfDossiersLegacy(params = {}) {
  const scope = params.scope === 'af' ? 'af' : 'pf'
  const jsp = scope === 'af' ? 'elementsLiquidationAF.jsp' : 'elementsLiquidationPF.jsp'
  const mapRow = scope === 'af' ? mapLegacyAfLoadingArgs : mapLegacyPfLoadingArgs
  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })
  const { data } = await energizerAxios.get(jsp, {
    params: legacyParams,
    responseType: 'text',
    skipErrorNotify: true,
  })
  return parsePfDossiersFromElementsLiquidationHtml(data, mapRow)
}



export async function searchPfDossiers(params = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return searchPfDossiersLegacy(params)
  }

  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })

  return callApi(async () => {
    const { data } = await api.get(ENERGIZER_API.pf.dossiers, {
      params: legacyParams,
      skipErrorNotify: true,
    })
    const list = unwrapData(data)
    return Array.isArray(list) ? list : []
  })

}



export async function savePfLiquidation(form) {
  // Exigence métier: soumission PF via servlet legacy /eltliquidationpf.
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.eltliquidationpf,
    referer: legacyPfLiquidationRefererUrl(),
    buildPayload: buildPfElementsLiquidationApiPayload,
    fields: PF_ELEMENTS_LIQUIDATION_SUBMIT_FIELDS,
    submitButton: 'btnsavedroit',
    submitButtonValue: 'Valider',
  })
}



export async function savePfAllocationFamiliale(form) {
  // Exigence métier: soumission AF via servlet legacy /eltliquidationaf.
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.eltliquidationaf,
    referer: legacyAfLiquidationRefererUrl(),
    buildPayload: buildPfAllocationFamilialeApiPayload,
    fields: PF_AF_SUBMIT_FIELDS,
    submitButton: 'btnsavedroit',
    submitButtonValue: 'Valider',
  })
}



export async function listReprises(params = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return listReprisesLegacy(params)
  }

  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })

  return callApi(async () => {
    const { data } = await api.get(ENERGIZER_API.pf.reprises, {
      params: legacyParams,
      skipErrorNotify: true,
    })
    const list = unwrapData(data)
    return Array.isArray(list) ? list : []
  })
}



export async function saveReprise(form) {
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.gestiondesreprises,
    referer: legacyReprisesRefererUrl(),
    buildPayload: buildPfRepriseApiPayload,
    fields: PF_REPRISE_SUBMIT_FIELDS,
  })
}



export async function deleteReprise(form) {
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.delnonreprise,
    referer: legacyReprisesRefererUrl(),
    buildPayload: buildPfRepriseDeleteApiPayload,
    fields: PF_REPRISE_DELETE_FIELDS,
  })
}



export async function listPeriodesActivite(params = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return listPeriodesLegacy(params)
  }

  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })

  return callApi(async () => {
    const { data } = await api.get(ENERGIZER_API.pf.periodesActivite, {
      params: legacyParams,
      skipErrorNotify: true,
    })
    const list = unwrapData(data)
    return Array.isArray(list) ? list : []
  })
}



export async function savePeriodeActivite(form) {
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.gestionperiodeactivite,
    referer: legacyPeriodeRefererUrl(),
    buildPayload: buildPfPeriodeActiviteApiPayload,
    fields: PF_PERIODE_SUBMIT_FIELDS,
  })
}



export async function listPiecesMaintienDroit(params = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return listPmdLegacy(params)
  }

  const legacyParams = params.catalog
    ? {}
    : toLegacyApiPayload(LegacyOperation.PF_SEARCH, {
        criteria: params.criteria,
        start: params.start,
        end: params.end,
      })

  return callApi(async () => {
    const { data } = await api.get(ENERGIZER_API.pf.piecesMaintienDroit, {
      params: legacyParams,
      skipErrorNotify: true,
    })
    const list = unwrapData(data)
    return Array.isArray(list) ? list : []
  })
}



export async function savePieceMaintienDroit(form) {
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.gestpmd,
    referer: legacyPmdRefererUrl(),
    buildPayload: (f) => buildPfPmdApiPayload(f, { action: 'save' }),
    fields: PF_PMD_SUBMIT_FIELDS,
  })
}



export async function deletePieceMaintienDroit(form) {
  return submitPfLiquidationLegacy(form, {
    servlet: ENERGIZER_LEGACY_SERVLETS.gestpmd,
    referer: legacyPmdRefererUrl(),
    buildPayload: (f) => buildPfPmdApiPayload(f, { action: 'delete' }),
    fields: PF_PMD_SUBMIT_FIELDS,
  })
}



export async function searchStatistiquesSituations(filters) {
  if (isEnergizerLegacyAuthEnabled()) {
    return searchStatistiquesLegacy(filters)
  }

  const payload = toLegacyApiPayload(LegacyOperation.PF_STATISTIQUES, filters)

  return callApi(async () => {
    const { data } = await api.post(ENERGIZER_API.pf.statistiques, payload, {
      skipErrorNotify: true,
    })
    const list = unwrapData(data)
    return Array.isArray(list) ? list : []
  })
}


