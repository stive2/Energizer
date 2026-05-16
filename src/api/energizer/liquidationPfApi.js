import { api } from 'src/services/http/cnpsHttp.js'
import { ENERGIZER_API } from './paths.js'
import { callApi, unwrapData } from './callApi.js'
import {
  MOCK_PF_DOSSIERS,
  MOCK_REPRISES,
  MOCK_PERIODES,
  MOCK_PMD,
  mockSearchPfDossiers,
  mockSubmitOk,
} from './mocks/pfMocks.js'

export async function searchPfDossiers(params = {}) {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.pf.dossiers, { params, skipErrorNotify: true })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => mockSearchPfDossiers(),
  )
}

export async function savePfLiquidation(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.pf.liquidation, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function savePfAllocationFamiliale(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.pf.allocationsFamiliales, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function listReprises(params = {}) {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.pf.reprises, { params, skipErrorNotify: true })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => MOCK_REPRISES,
  )
}

export async function saveReprise(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.pf.reprises, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function deleteReprise(id) {
  return callApi(
    async () => {
      const { data } = await api.delete(ENERGIZER_API.pf.reprise(id))
      return unwrapData(data)
    },
    () => ({ success: true, id }),
  )
}

export async function listPeriodesActivite(params = {}) {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.pf.periodesActivite, { params, skipErrorNotify: true })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => MOCK_PERIODES,
  )
}

export async function savePeriodeActivite(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.pf.periodesActivite, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function listPiecesMaintienDroit(params = {}) {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.pf.piecesMaintienDroit, { params, skipErrorNotify: true })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => MOCK_PMD,
  )
}

export async function savePieceMaintienDroit(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.pf.piecesMaintienDroit, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function deletePieceMaintienDroit(id) {
  return callApi(
    async () => {
      const { data } = await api.delete(ENERGIZER_API.pf.pieceMaintienDroit(id))
      return unwrapData(data)
    },
    () => ({ success: true, id }),
  )
}

export async function searchStatistiquesSituations(filters) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.pf.statistiques, filters, { skipErrorNotify: true })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => MOCK_PF_DOSSIERS,
  )
}
