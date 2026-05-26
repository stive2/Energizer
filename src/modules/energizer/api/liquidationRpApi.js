import { api } from 'src/modules/shared/services/http/cnpsHttp.js'

import { ENERGIZER_API } from './paths.js'

import { callApi, unwrapData } from './callApi.js'

import {

  LegacyOperation,

  toLegacyApiPayload,

} from './adapters/energizerLegacyAdapter.js'

import {

  mockFetchRpEmployeur,

  mockSearchRpDossiers,

  mockNotesFraisMeta,

  mockSubmitOk,

} from './mocks/rpMocks.js'



export async function fetchRpEmployeur(matricule) {

  const mat = String(matricule || '').trim()

  let result = null

  try {

    const { data } = await api.get(ENERGIZER_API.rp.employeur, {

      params: { mat },

      skipErrorNotify: true,

    })

    result = unwrapData(data)

  } catch {

    /* backend indisponible */

  }

  if (result?.raison_sociale || result?.nomemployeur) {

    return result

  }

  return mockFetchRpEmployeur(mat)

}



export async function searchRpDossiers(params = {}) {

  const legacyParams = toLegacyApiPayload(LegacyOperation.RP_SEARCH, params)

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.rp.dossiers, {

        params: legacyParams,

        skipErrorNotify: true,

      })

      const list = unwrapData(data)

      return Array.isArray(list) ? list : []

    },

    () => mockSearchRpDossiers(),

  )

}



export async function saveRpDeclaration(form) {

  const payload = toLegacyApiPayload(LegacyOperation.RP_DECLARATION, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.rp.declaration, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function saveCertificatInit(form) {

  const payload = toLegacyApiPayload(LegacyOperation.RP_CERTIFICAT_INIT, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.rp.certificatInit, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function saveCertificatDeces(form) {

  const payload = toLegacyApiPayload(LegacyOperation.RP_CERTIFICAT_DECES, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.rp.certificatDeces, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function saveNoteFrais(form) {

  const payload = toLegacyApiPayload(LegacyOperation.RP_NOTE_FRAIS, form)

  return callApi(

    async () => {

      const { data } = await api.post(ENERGIZER_API.rp.notesFrais, payload)

      return unwrapData(data)

    },

    () => mockSubmitOk(payload),

  )

}



export async function fetchNotesFraisDossiers() {

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.rp.notesFraisDossiers, { skipErrorNotify: true })

      return unwrapData(data)

    },

    () => mockNotesFraisMeta().dossiers,

  )

}



export async function fetchNotesFraisObjets() {

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.rp.notesFraisObjets, { skipErrorNotify: true })

      return unwrapData(data)

    },

    () => mockNotesFraisMeta().objets,

  )

}



export async function fetchTiersBeneficiaires(numassu) {

  return callApi(

    async () => {

      const { data } = await api.get(ENERGIZER_API.rp.tiersBeneficiaires, {

        params: { numassu },

        skipErrorNotify: true,

      })

      return unwrapData(data)

    },

    () => mockNotesFraisMeta().tiers[numassu] ?? [],

  )

}


