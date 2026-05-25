import { api } from 'src/services/http/cnpsHttp.js'

import { ENERGIZER_API } from './paths.js'

import { callApi, unwrapData } from './callApi.js'

import {

  LegacyOperation,

  toLegacyApiPayload,

} from './adapters/energizerLegacyAdapter.js'

import {

  MOCK_PF_DOSSIERS,

  MOCK_REPRISES,

  MOCK_PERIODES,

  MOCK_PMD,

  mockSearchPfDossiers,

  mockSubmitOk,

} from './mocks/pfMocks.js'



export async function searchPfDossiers(params = {}) {

  const legacyParams = toLegacyApiPayload(LegacyOperation.PF_SEARCH, params)

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.pf.dossiers, {

        params: legacyParams,

        skipErrorNotify: true,

      })

      const list = unwrapData(data)

      return Array.isArray(list) ? list : []

    },

    () => mockSearchPfDossiers(),

  )

}



export async function savePfLiquidation(form) {

  const payload = toLegacyApiPayload(LegacyOperation.PF_ELEMENTS_LIQUIDATION, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.liquidation, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function savePfAllocationFamiliale(form) {

  const payload = toLegacyApiPayload(LegacyOperation.PF_ALLOCATION_FAMILIALE, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.allocationsFamiliales, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function listReprises(params = {}) {

  const legacyParams = toLegacyApiPayload(LegacyOperation.PF_SEARCH, params)

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.pf.reprises, {

        params: legacyParams,

        skipErrorNotify: true,

      })

      const list = unwrapData(data)

      return Array.isArray(list) ? list : []

    },

    () => MOCK_REPRISES,

  )

}



export async function saveReprise(form) {

  const payload = toLegacyApiPayload(LegacyOperation.PF_REPRISE, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.reprises, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function deleteReprise(form) {

  const legacyPayload = toLegacyApiPayload(LegacyOperation.PF_REPRISE_DELETE, form)

  return callApi(

    async () => {

      const { data } = await api.delete(ENERGIZER_API.pf.reprises, {

        params: legacyPayload,

      })

      return unwrapData(data)

    },

    () => ({ success: true, ...legacyPayload }),

  )

}



export async function listPeriodesActivite(params = {}) {

  const legacyParams = toLegacyApiPayload(LegacyOperation.PF_SEARCH, params)

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.pf.periodesActivite, {

        params: legacyParams,

        skipErrorNotify: true,

      })

      const list = unwrapData(data)

      return Array.isArray(list) ? list : []

    },

    () => MOCK_PERIODES,

  )

}



export async function savePeriodeActivite(form) {

  const payload = toLegacyApiPayload(LegacyOperation.PF_PERIODE_ACTIVITE, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.periodesActivite, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function listPiecesMaintienDroit(params = {}) {

  const legacyParams = toLegacyApiPayload(LegacyOperation.PF_SEARCH, params)

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.pf.piecesMaintienDroit, {

        params: legacyParams,

        skipErrorNotify: true,

      })

      const list = unwrapData(data)

      return Array.isArray(list) ? list : []

    },

    () => MOCK_PMD,

  )

}



export async function savePieceMaintienDroit(form) {

  const payload = toLegacyApiPayload(LegacyOperation.PF_PMD, form, { action: 'save' })

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.piecesMaintienDroit, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function deletePieceMaintienDroit(form) {

  const legacyPayload = toLegacyApiPayload(LegacyOperation.PF_PMD, form, { action: 'delete' })

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.piecesMaintienDroit, legacyPayload)

      return unwrapData(data)

    },

    () => ({ success: true, ...legacyPayload }),

  )

}



export async function searchStatistiquesSituations(filters) {

  const payload = toLegacyApiPayload(LegacyOperation.PF_STATISTIQUES, filters)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.pf.statistiques, payload, {

        skipErrorNotify: true,

      })

      const list = unwrapData(data)

      return Array.isArray(list) ? list : []

    },

    () => MOCK_PF_DOSSIERS,

  )

}


