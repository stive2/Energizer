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
  parseNumdossierFromAddpieceHtml,
  parsePieceTypeOptionsFromAddpieceHtml,
} from './adapters/parseNouveauDossierLegacyHtml.js'
import { NouveauDossierSubmitError } from './nouveauDossierErrors.js'

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

async function fetchSavedDossiersLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.getDossier)
  const rows = parseEnergizerLegacyRows(data, 'get_dossier.jsp')
  return normalizeSavedDossiersFromLegacy(rows)
}

function buildAddpieceRecepVariable({
  num_dossier,
  objet,
  num_assu,
  nom_requerant,
  adresse,
  tel,
  myobjet,
  date_demande,
}) {
  return [
    num_dossier,
    objet,
    num_assu,
    nom_requerant,
    adresse,
    tel,
    myobjet,
    date_demande,
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
    throw new NouveauDossierSubmitError(serverMessage)
  }

  if (!num_dossier) {
    if (serverMessage && isLegacyNouveauDossierSuccessMessage(serverMessage)) {
      return {
        success: true,
        num_dossier: '',
        code_type_pres: '',
        pieceTypeOptions: [],
        message: serverMessage,
        redirect: 'redirect',
      }
    }

    throw new NouveauDossierSubmitError(
      serverMessage ||
        'Enregistrement du dossier : réponse serveur inattendue (numéro de dossier introuvable).',
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
  const payload = toLegacyApiPayload(LegacyOperation.NOUVEAU_DOSSIER_PIECES, {
    context,
    pieceRows,
    username: options.username,
  })
  const response = await postEnergizerLegacyHtml(ENERGIZER_LEGACY_JSP.showPieces, payload)

  const serverMessage = extractLegacyNouveauDossierServerMessage(response)
  if (serverMessage && !isLegacyNouveauDossierSuccessMessage(serverMessage)) {
    throw new Error(serverMessage)
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

  const response = await postEnergizerLegacyHtml(ENERGIZER_LEGACY_JSP.endDossier, {
    numdossier,
    numassu: String(context?.numassu ?? ''),
  })

  const serverMessage = extractLegacyNouveauDossierServerMessage(response)
  if (serverMessage && !isLegacyNouveauDossierSuccessMessage(serverMessage)) {
    throw new Error(serverMessage)
  }

  const redirectedToJaccueil =
    response.redirectUrl?.includes('jAccueil') ||
    response.redirectUrl?.includes('pagePrincipale')

  if (!redirectedToJaccueil && isLegacySessionExpiredHtml(response.html)) {
    throw new Error('Session Energizer expirée. Veuillez vous reconnecter.')
  }

  return {
    ok: true,
    message: `Dossier ${numdossier} transmis pour traitement.`,
    code_situ: 'Receptionne',
    etape: 'Accueil',
  }
}

async function fetchJaccueilDossiersLegacy(currentNumdossier) {
  const rows = await fetchSavedDossiersLegacy()
  const mapped = normalizeJaccueilRowsFromLegacy(rows)
  if (currentNumdossier && !mapped.some((r) => r.num_dossier === currentNumdossier)) {
    mapped.unshift({
      num_dossier: currentNumdossier,
      nom_requerant: '',
      telephone: '',
      adresse: '',
      myobjet: '',
      datedemande: '',
      etape: 'Accueil',
      date_position: '',
      code_situ: 'Receptionne',
    })
  }
  return mapped
}

async function fetchReceptionPiecesContextLegacy(row) {
  const num_dossier = String(row?.num_dossier ?? '').trim()
  if (!num_dossier) {
    throw new Error('Numéro de dossier manquant.')
  }

  const variable = buildAddpieceRecepVariable({
    num_dossier,
    objet: row?.Obj || row?.objet || num_dossier.charAt(0),
    num_assu: row?.num_assu ?? row?.numassu ?? '',
    nom_requerant: row?.nom_requerant ?? row?.nomcomplet ?? '',
    adresse: row?.adresse ?? '',
    tel: row?.telephone ?? row?.tel ?? '',
    myobjet: row?.myobjet ?? row?.myObjet ?? '',
    date_demande: row?.datedemande ?? row?.date_demande ?? '',
  })

  const html = await getEnergizerLegacyHtml(ENERGIZER_LEGACY_JSP.addpieceRecep, { variable })

  if (isLegacySessionExpiredHtml(html)) {
    throw new Error('Session Energizer expirée. Veuillez vous reconnecter.')
  }

  return {
    pieceTypeOptions: parsePieceTypeOptionsFromAddpieceHtml(html),
    existingPieces: parseExistingPiecesFromAddpieceRecepHtml(html),
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

export async function fetchJaccueilDossiers(currentNumdossier) {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchJaccueilDossiersLegacy(currentNumdossier)
  }
  const { data } = await api.get(`${ENERGIZER_API.reception.dossiers}/jaccueil`, {
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

export async function listSavedNouveauDossiers() {
  if (isEnergizerLegacyAuthEnabled()) {
    return fetchSavedDossiersLegacy()
  }

  const agent = getConnectedAgentContext()
  const { data } = await api.get(ENERGIZER_API.reception.dossiers, {
    params: { agentMatricule: agent.matricule },
    skipErrorNotify: true,
  })
  const list = unwrapData(data)
  const arr = Array.isArray(list) ? list : list?.root ?? []
  return arr.filter((row) => !row.agentMatricule || row.agentMatricule === agent.matricule)
}
