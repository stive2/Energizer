import { api } from 'src/modules/shared/services/http/cnpsHttp.js'
import { isEnergizerLegacyAuthEnabled } from 'src/modules/shared/config/energizerHttp.js'
import { ENERGIZER_API } from './paths.js'
import { unwrapData } from './callApi.js'
import { employeurRowsFromPayload, firstAssureRow } from './lookupResponseUtils.js'
import { normalizeCircuitsList } from 'src/modules/energizer/utils/nouveauDossierCircuits.js'
import { getConnectedAgentContext } from 'src/modules/energizer/utils/nouveauDossierAgentContext.js'
import {
  LegacyOperation,
  toLegacyApiPayload,
} from './adapters/energizerLegacyAdapter.js'
import {
  ENERGIZER_LEGACY_JSP,
  getEnergizerLegacyJsp,
  getEnergizerLegacyHtml,
  postEnergizerLegacyJsp,
  postEnergizerLegacyHtml,
  postEnergizerLegacyServlet,
  legacyNouveauDossierRefererUrl,
  parseEnergizerLegacyRows,
} from './energizerLegacyClient.js'
import {
  normalizeNaturePrestations,
  normalizeNouveauDossierObjets,
  normalizeTypeCircuits,
  normalizeSavedDossiersFromLegacy,
  normalizeJaccueilRowsFromLegacy,
} from './adapters/nouveauDossierLegacyAdapter.js'
import {
  extractLegacyNouveauDossierServerMessage,
  isLegacyNouveauDossierSuccessMessage,
  isLegacySessionExpiredHtml,
  parseExistingPiecesFromAddpieceRecepHtml,
  parseAddpieceRecepHiddenFields,
  parseNumdossierFromAddpieceHtml,
  parsePieceTypeOptionsFromAddpieceHtml,
  parsePieceTypeOptionsFromLegacyPiecesHtml,
  toUserFacingNouveauDossierError,
} from './adapters/parseNouveauDossierLegacyHtml.js'
import { NouveauDossierSubmitError } from './nouveauDossierErrors.js'
import { buildNouveauDossierReceptionPiecesApiPayload } from 'src/modules/energizer/data/nouveauDossierLegacyFields.js'
import {
  resolveObjCodeFromNumDossier,
  toReceptionPiecesRow,
} from 'src/modules/energizer/utils/nouveauDossierPieces.js'
import { isEnergizerLegacySuccessRedirectUrl } from 'src/modules/energizer/utils/energizerLegacySessionDetect.js'

async function fetchNouveauDossierObjetsLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.nouvDossier)
  const rows = parseEnergizerLegacyRows(data, 'nouvDossier.jsp')
  const list = normalizeNouveauDossierObjets(rows)
  if (!list.length) {
    throw new Error('Aucun type de prestation disponible sur le serveur Energizer.')
  }
  return list
}

async function fetchNaturePrestationsLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.naturePrestation)
  const rows = parseEnergizerLegacyRows(data, 'naturePrestation.jsp')
  return normalizeNaturePrestations(rows)
}

async function fetchTypeCircuitsLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.typeCircuit)
  const rows = parseEnergizerLegacyRows(data, 'typecircuit.jsp')
  const list = normalizeTypeCircuits(rows)
  return normalizeCircuitsList(list)
}

async function fetchInfoAssureLegacy(mat) {
  const data = await postEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.infoAssure, { mat })
  const row = firstAssureRow(data)
  return row ? { root: [row] } : { root: [] }
}

function quoteMatForEmployeurLookup(mat) {
  const raw = String(mat ?? '').trim()
  if (!raw) return raw
  if (raw.startsWith("'") && raw.endsWith("'")) return raw
  return `'${raw.replace(/'/g, "''")}'`
}

async function fetchInfoEmployeurLegacy(mat) {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.infoEmployeur, {
    mat: quoteMatForEmployeurLookup(mat),
  })
  return employeurRowsFromPayload(parseEnergizerLegacyRows(data, 'infoemployeur.jsp'))
}

async function fetchTeleimportationLegacy(params) {
  return postEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.teleimportation, params)
}

/**
 * Filtres alignés jAccueil.jsp → get/get_dossier.jsp (recherche LIKE côté serveur).
 * @param {{ num_dossier?: string, num_assu?: string, nom_requerant?: string, localisation?: string, initiateur?: string }} [filters]
 */
function buildGetDossierLegacyParams(filters = {}) {
  const params = {}
  const map = {
    num_dossier: filters.num_dossier,
    num_assu: filters.num_assu,
    nom_requerant: filters.nom_requerant,
    localisation: filters.localisation,
    initiateur: filters.initiateur,
  }
  Object.entries(map).forEach(([key, value]) => {
    const trimmed = String(value ?? '').trim()
    if (trimmed) params[key] = trimmed
  })
  return params
}

async function fetchSavedDossiersLegacy(filters = {}) {
  const data = await getEnergizerLegacyJsp(
    ENERGIZER_LEGACY_JSP.getDossier,
    buildGetDossierLegacyParams(filters),
  )
  const rows = parseEnergizerLegacyRows(data, 'get_dossier.jsp')
  return normalizeSavedDossiersFromLegacy(rows)
}

function buildAddpieceRecepVariable(row) {
  const num_dossier = String(row?.num_dossier ?? '').trim()
  const Obj =
    String(row?.Obj ?? '').trim() || resolveObjCodeFromNumDossier(num_dossier)
  const myobjet = String(row?.myobjet ?? row?.myObjet ?? '').trim()

  return [
    num_dossier,
    Obj,
    row?.num_assu ?? row?.numassu ?? '',
    row?.nom_requerant ?? row?.nomcomplet ?? '',
    row?.adresse ?? '',
    row?.tel ?? row?.telephone ?? '',
    myobjet,
    row?.date_demande ?? row?.datedemande ?? '',
  ]
    .map((part) => String(part ?? ''))
    .join(';')
}

async function submitNouveauDossierLegacy(form) {
  const payload = toLegacyApiPayload(LegacyOperation.NOUVEAU_DOSSIER_SUBMIT, form)
  const response = await postEnergizerLegacyHtml(
    ENERGIZER_LEGACY_JSP.nouvdossierServlet,
    payload,
    { referer: legacyNouveauDossierRefererUrl() },
  )

  if (isLegacySessionExpiredHtml(response.html)) {
    throw new NouveauDossierSubmitError('Session Energizer expirée. Veuillez vous reconnecter.')
  }

  const serverMessage = extractLegacyNouveauDossierServerMessage(response)
  const num_dossier = parseNumdossierFromAddpieceHtml(response.html)
  const isAttestation = payload.code_pres === 'X'

  if (serverMessage && !isLegacyNouveauDossierSuccessMessage(serverMessage)) {
    throw new NouveauDossierSubmitError(toUserFacingNouveauDossierError(serverMessage))
  }

  if (!num_dossier) {
    if (serverMessage && isLegacyNouveauDossierSuccessMessage(serverMessage)) {
      return {
        success: true,
        num_dossier: '',
        code_type_pres: '',
        pieceTypeOptions: [],
        message: toUserFacingNouveauDossierError(serverMessage),
        redirect: 'redirect',
      }
    }

    throw new NouveauDossierSubmitError(
      toUserFacingNouveauDossierError(
        serverMessage,
        'Enregistrement du dossier : réponse serveur inattendue (numéro de dossier introuvable).',
      ),
    )
  }

  const pieceTypeOptions = parsePieceTypeOptionsFromAddpieceHtml(response.html)

  return {
    success: true,
    num_dossier,
    code_type_pres: num_dossier,
    pieceTypeOptions,
    message: isAttestation
      ? serverMessage ||
        "Votre demande d'attestation pour soumission a été enregistrée avec succès."
      : `Dossier enregistré avec succès (${num_dossier}).`,
    redirect: isAttestation ? 'redirect' : 'addpiece',
  }
}

async function persistNouveauDossierPiecesLegacy(context, pieceRows, options = {}) {
  const isReception = options.mode === 'reception'
  const payload = isReception
    ? buildNouveauDossierReceptionPiecesApiPayload(context, pieceRows, options)
    : toLegacyApiPayload(LegacyOperation.NOUVEAU_DOSSIER_PIECES, {
        context,
        pieceRows,
        username: options.username,
      })

  const endPath = isReception
    ? ENERGIZER_LEGACY_JSP.showAjoutPieces
    : ENERGIZER_LEGACY_JSP.showPieces

  const response = await postEnergizerLegacyServlet(endPath, payload)

  const serverMessage = extractLegacyNouveauDossierServerMessage(response)
  if (serverMessage && !isLegacyNouveauDossierSuccessMessage(serverMessage)) {
    throw new Error(toUserFacingNouveauDossierError(serverMessage))
  }
  if (isLegacySessionExpiredHtml(response.html)) {
    throw new Error('Session Energizer expirée. Veuillez vous reconnecter.')
  }

  return {
    ok: true,
    numdossier: payload.numdossier,
    count: Number.parseInt(String(payload.psize ?? '0'), 10) || 0,
  }
}

async function finalizeNouveauDossierLegacy(context) {
  const numdossier = String(context?.numdossier ?? '').trim()
  if (!numdossier) {
    throw new Error('Numéro de dossier manquant pour la finalisation.')
  }

  // show.jsp / showAjout.jsp (récap 2 boutons) → POST end.jsp uniquement.
  const numassu = String(context?.numassu ?? '').trim() || 'RAS'

  const response = await postEnergizerLegacyServlet(ENERGIZER_LEGACY_JSP.endDossier, {
    numdossier,
    numassu,
  })

  const serverMessage = extractLegacyNouveauDossierServerMessage(response)
  if (serverMessage && !isLegacyNouveauDossierSuccessMessage(serverMessage)) {
    throw new Error(toUserFacingNouveauDossierError(serverMessage))
  }

  const redirectedToSuccess =
    isEnergizerLegacySuccessRedirectUrl(response.redirectUrl) ||
    isEnergizerLegacySuccessRedirectUrl(response.finalUrl)

  if (!redirectedToSuccess && isLegacySessionExpiredHtml(response.html)) {
    throw new Error('Session Energizer expirée. Veuillez vous reconnecter.')
  }

  if (!redirectedToSuccess && response.error) {
    throw new Error(toUserFacingNouveauDossierError(response.error))
  }

  return {
    ok: true,
    message: `Dossier ${numdossier} transmis pour traitement.`,
    code_situ: 'En Cours d instruction',
    etape: context?.localisation ?? 'Accueil',
    num_dossier: numdossier,
  }
}

async function fetchJaccueilDossiersLegacy(filters = {}) {
  const query = {}
  const map = {
    num_dossier: filters.num_dossier,
    num_assu: filters.num_assu,
    nom_requerant: filters.nom_requerant,
    localisation: filters.localisation,
    initiateur: filters.initiateur,
  }
  Object.entries(map).forEach(([key, value]) => {
    const trimmed = String(value ?? '').trim()
    if (trimmed) query[key] = trimmed
  })

  const rows = await fetchSavedDossiersLegacy(query)
  return normalizeJaccueilRowsFromLegacy(rows)
}

async function fetchReceptionPiecesContextLegacy(row) {
  const receptionRow = toReceptionPiecesRow(row)
  const num_dossier = String(receptionRow?.num_dossier ?? '').trim()
  if (!num_dossier) {
    throw new Error('Numéro de dossier manquant.')
  }

  const variable = buildAddpieceRecepVariable(receptionRow)

  const html = await getEnergizerLegacyHtml(ENERGIZER_LEGACY_JSP.addpieceRecep, { variable })

  if (isLegacySessionExpiredHtml(html)) {
    throw new Error('Session Energizer expirée. Veuillez vous reconnecter.')
  }

  return {
    pieceTypeOptions: parsePieceTypeOptionsFromLegacyPiecesHtml(html),
    existingPieces: parseExistingPiecesFromAddpieceRecepHtml(html),
    serverContext: parseAddpieceRecepHiddenFields(html),
  }
}

export async function fetchNouveauDossierObjets() {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchNouveauDossierObjetsLegacy()
  }
  const { data } = await api.get(ENERGIZER_API.reception.objets, { skipErrorNotify: true })
  const list = unwrapData(data)
  const arr = Array.isArray(list) ? list : list?.root ?? []
  if (!arr.length) {
    throw new Error('Aucun type de prestation disponible.')
  }
  return normalizeNouveauDossierObjets(arr)
}

export async function fetchNaturePrestations() {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchNaturePrestationsLegacy()
  }
  const { data } = await api.get(ENERGIZER_API.reception.naturePrestations, {
    skipErrorNotify: true,
  })
  const arr = unwrapData(data) ?? []
  return normalizeNaturePrestations(Array.isArray(arr) ? arr : arr?.root ?? [])
}

export async function fetchTypeCircuits() {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchTypeCircuitsLegacy()
  }
  const { data } = await api.get(ENERGIZER_API.reception.typeCircuits, {
    skipErrorNotify: true,
  })
  const arr = unwrapData(data) ?? []
  const raw = Array.isArray(arr) ? arr : arr?.root ?? []
  return normalizeCircuitsList(normalizeTypeCircuits(raw))
}

export async function fetchInfoAssure(mat) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchInfoAssureLegacy(mat)
  }
  const { data } = await api.post(
    ENERGIZER_API.reception.infoAssure,
    { mat },
    { skipErrorNotify: true },
  )
  const row = firstAssureRow(unwrapData(data))
  return row ? { root: [row] } : { root: [] }
}

export async function fetchInfoEmployeur(mat) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchInfoEmployeurLegacy(mat)
  }
  const { data } = await api.get(ENERGIZER_API.reception.infoEmployeur, {
    params: { mat },
    skipErrorNotify: true,
  })
  return employeurRowsFromPayload(unwrapData(data))
}

export async function fetchTeleimportation(params) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchTeleimportationLegacy(params)
  }
  const { data } = await api.post(ENERGIZER_API.reception.teleimportation, params, {
    skipErrorNotify: true,
  })
  return unwrapData(data)
}

export async function submitNouveauDossier(form) {
  if (isEnergizerLegacyAuthEnabled()) {
    return submitNouveauDossierLegacy(form)
  }

  const payload = toLegacyApiPayload(LegacyOperation.NOUVEAU_DOSSIER_SUBMIT, form)
  const { data } = await api.post(ENERGIZER_API.reception.submit, payload, {
    skipErrorNotify: true,
  })
  const result = unwrapData(data)
  if (result?.success === false || (!result?.num_dossier && !result?.code_type_pres)) {
    throw new Error(result?.message || 'Enregistrement du dossier indisponible sur le serveur.')
  }
  return result
}

/**
 * Pièces jointes — payload show.jsp (après enregistrement dossier).
 * @param {Record<string, unknown>} context
 * @param {Array<Record<string, unknown>>} pieceRows
 * @param {{ username?: string }} [options]
 */
export function buildNouveauDossierPiecesPayload(context, pieceRows, options = {}) {
  return toLegacyApiPayload(LegacyOperation.NOUVEAU_DOSSIER_PIECES, {
    context,
    pieceRows,
    username: options.username,
  })
}

export async function persistNouveauDossierPieces(context, pieceRows, options = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return persistNouveauDossierPiecesLegacy(context, pieceRows, options)
  }
  const payload = buildNouveauDossierPiecesPayload(context, pieceRows, options)
  const { data } = await api.post(`${ENERGIZER_API.reception.submit}/pieces`, payload, {
    skipErrorNotify: true,
  })
  return unwrapData(data)
}

export async function finalizeNouveauDossier(context) {
  if (isEnergizerLegacyAuthEnabled()) {
    return finalizeNouveauDossierLegacy(context)
  }
  const { data } = await api.post(
    `${ENERGIZER_API.reception.submit}/finalize`,
    { numdossier: context?.numdossier, numassu: context?.numassu },
    { skipErrorNotify: true },
  )
  return unwrapData(data)
}

export async function fetchJaccueilDossiers(filters = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchJaccueilDossiersLegacy(filters)
  }
  const { data } = await api.get(`${ENERGIZER_API.reception.dossiers}/jaccueil`, {
    params: filters,
    skipErrorNotify: true,
  })
  return unwrapData(data) ?? []
}

export async function fetchReceptionPiecesContext(row) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchReceptionPiecesContextLegacy(row)
  }
  const num = row?.num_dossier ?? row?.id
  const { data } = await api.get(`${ENERGIZER_API.reception.dossiers}/${encodeURIComponent(num)}/pieces`, {
    skipErrorNotify: true,
  })
  return unwrapData(data) ?? { pieceTypeOptions: [], existingPieces: [] }
}

/**
 * @param {{ num_dossier?: string, num_assu?: string, nom_requerant?: string, localisation?: string, initiateur?: string }} [filters]
 */
export async function listSavedNouveauDossiers(filters = {}) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchSavedDossiersLegacy(filters)
  }

  const agent = getConnectedAgentContext()
  const { data } = await api.get(ENERGIZER_API.reception.dossiers, {
    params: { agentMatricule: agent.matricule, ...filters },
    skipErrorNotify: true,
  })
  const list = unwrapData(data)
  const arr = Array.isArray(list) ? list : list?.root ?? []
  return arr.filter((row) => !row.agentMatricule || row.agentMatricule === agent.matricule)
}
