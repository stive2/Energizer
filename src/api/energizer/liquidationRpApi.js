import { api } from 'src/services/http/cnpsHttp.js'
import { ENERGIZER_API } from './paths.js'
import { callApi, unwrapData } from './callApi.js'
import {
  mockFetchRpEmployeur,
  mockSearchRpDossiers,
  mockNotesFraisMeta,
  mockSubmitOk,
} from './mocks/rpMocks.js'

export async function fetchRpEmployeur(matricule) {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.rp.employeur, {
        params: { mat: matricule },
        skipErrorNotify: true,
      })
      return unwrapData(data)
    },
    () => mockFetchRpEmployeur(matricule),
  )
}

export async function searchRpDossiers(params = {}) {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.rp.dossiers, { params, skipErrorNotify: true })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => mockSearchRpDossiers(),
  )
}

export async function saveRpDeclaration(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.rp.declaration, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function saveCertificatInit(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.rp.certificatInit, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function saveCertificatDeces(payload) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.rp.certificatDeces, payload)
      return unwrapData(data)
    },
    () => mockSubmitOk(payload),
  )
}

export async function saveNoteFrais(payload) {
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
