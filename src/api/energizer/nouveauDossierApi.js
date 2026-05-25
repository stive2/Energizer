import { api } from 'src/services/http/cnpsHttp.js'
import { ENERGIZER_API } from './paths.js'
import { callApi, unwrapData } from './callApi.js'
import { employeurRowsFromPayload, firstAssureRow } from './lookupResponseUtils.js'
import { normalizeCircuitsList } from 'src/utils/energizer/nouveauDossierCircuits.js'
import {
  mockFetchNouveauDossierObjets,
  mockFetchNaturePrestations,
  mockFetchTypeCircuits,
  mockFetchInfoAssure,
  mockFetchInfoEmployeur,
  mockTeleimportation,
  mockSubmitNouveauDossier,
  mockListSavedDossiers,
} from './mocks/nouveauDossierMocks.js'
import { getConnectedAgentContext } from 'src/utils/energizer/nouveauDossierAgentContext.js'
import {
  LegacyOperation,
  toLegacyApiPayload,
} from './adapters/energizerLegacyAdapter.js'

export async function fetchNouveauDossierObjets() {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.reception.objets, { skipErrorNotify: true })
      const list = unwrapData(data)
      const arr = Array.isArray(list) ? list : list?.root ?? []
      if (arr.length) return arr
      return mockFetchNouveauDossierObjets()
    },
    () => mockFetchNouveauDossierObjets(),
  ).catch(() => mockFetchNouveauDossierObjets())
}

export async function fetchNaturePrestations() {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.reception.naturePrestations, {
        skipErrorNotify: true,
      })
      const arr = unwrapData(data) ?? []
      return arr.length ? arr : mockFetchNaturePrestations()
    },
    () => mockFetchNaturePrestations(),
  ).catch(() => mockFetchNaturePrestations())
}

export async function fetchTypeCircuits() {
  let raw = []
  try {
    raw = await callApi(
      async () => {
        const { data } = await api.get(ENERGIZER_API.reception.typeCircuits, {
          skipErrorNotify: true,
        })
        const arr = unwrapData(data) ?? []
        return Array.isArray(arr) ? arr : arr?.root ?? []
      },
      () => mockFetchTypeCircuits(),
    )
  } catch {
    raw = mockFetchTypeCircuits()
  }
  if (!raw?.length) {
    raw = mockFetchTypeCircuits()
  }
  return normalizeCircuitsList(raw)
}

export async function fetchInfoAssure(mat) {
  let row = null
  try {
    const { data } = await api.post(
      ENERGIZER_API.reception.infoAssure,
      { mat },
      { skipErrorNotify: true },
    )
    row = firstAssureRow(unwrapData(data))
  } catch {
    /* backend indisponible ou erreur réseau */
  }
  if (!row) {
    row = firstAssureRow(mockFetchInfoAssure(mat))
  }
  return row ? { root: [row] } : { root: [] }
}

export async function fetchInfoEmployeur(mat) {
  let rows = []
  try {
    const { data } = await api.get(ENERGIZER_API.reception.infoEmployeur, {
      params: { mat },
      skipErrorNotify: true,
    })
    rows = employeurRowsFromPayload(unwrapData(data))
  } catch {
    /* backend indisponible */
  }
  if (!rows.length) {
    rows = employeurRowsFromPayload(mockFetchInfoEmployeur(mat))
  }
  return rows
}

export async function fetchTeleimportation(params) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.reception.teleimportation, params, {
        skipErrorNotify: true,
      })
      return unwrapData(data)
    },
    () => mockTeleimportation(params),
  )
}

export async function submitNouveauDossier(form, validationContext = {}) {
  const payload = toLegacyApiPayload(LegacyOperation.NOUVEAU_DOSSIER_SUBMIT, form)
  try {
    const { data } = await api.post(ENERGIZER_API.reception.submit, payload, {
      skipErrorNotify: true,
    })
    const result = unwrapData(data)
    if (result?.success !== false && (result?.num_dossier || result?.code_type_pres)) {
      return result
    }
  } catch {
    /* backend indisponible */
  }
  return mockSubmitNouveauDossier(payload, validationContext)
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

export async function listSavedNouveauDossiers() {
  const agent = getConnectedAgentContext()
  try {
    const { data } = await api.get(ENERGIZER_API.reception.dossiers, {
      params: { agentMatricule: agent.matricule },
      skipErrorNotify: true,
    })
    const list = unwrapData(data)
    const arr = Array.isArray(list) ? list : list?.root ?? []
    if (arr.length) {
      return arr.filter(
        (row) => !row.agentMatricule || row.agentMatricule === agent.matricule,
      )
    }
  } catch {
    /* backend indisponible */
  }
  return mockListSavedDossiers()
}
