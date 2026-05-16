import { regexPatterns } from 'src/js/regex.js'
import { api } from 'src/services/http/cnpsHttp.js'
import { ENERGIZER_API } from './paths.js'
import { callApi, unwrapData } from './callApi.js'
import {
  mockFetchInfoAssure,
  mockFetchInfoEmployeur,
  mockFetchTeleImportation,
  mockListDossiers,
  mockSaveDossier,
  mockPrestationTypes,
} from './mocks/receptionMocks.js'

export async function fetchInfoAssure(matricule, codePres, libelle) {
  const mat = (matricule || '').trim().toUpperCase()
  if (!regexPatterns.numAssu1.test(mat) && !regexPatterns.numAssu2.test(mat)) {
    throw new Error('INVALID_MAT')
  }
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.reception.assure, {
        params: { matricule, code_pres: codePres, libelle },
        skipErrorNotify: true,
      })
      const row = unwrapData(data)
      return {
        nom_complet: row.nom_complet ?? row.nomcompletass,
        date_naiss: row.date_naiss,
        centre_ges: row.centre_ges,
        pre_depot_pvid: row.pre_depot_pvid ?? null,
        ecart_mois_60: row.ecart_mois_60 ?? 0,
      }
    },
    () => mockFetchInfoAssure(),
  )
}

export async function fetchInfoEmployeur(matEmployeur) {
  const mat = (matEmployeur || '').trim().toUpperCase()
  if (!regexPatterns.numEmpl1.test(mat) && !regexPatterns.numEmpl2.test(mat)) {
    throw new Error('INVALID_EMP')
  }
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.reception.employeur, {
        params: { matricule: matEmployeur },
        skipErrorNotify: true,
      })
      const row = unwrapData(data)
      return {
        RAISON_SOCIALE: row.RAISON_SOCIALE ?? row.raison_sociale,
        ADRESSE_EMPLOYEUR: row.ADRESSE_EMPLOYEUR ?? row.adresse,
        BOITE_POSTALE: row.BOITE_POSTALE ?? row.boite_postale,
        REGIME_CNPS: row.REGIME_CNPS ?? row.regime,
        CODE_GPE_RISQUE: row.CODE_GPE_RISQUE ?? row.code_gpe_risque,
        CODE_CENTRE: row.CODE_CENTRE ?? row.code_centre,
      }
    },
    () => mockFetchInfoEmployeur(),
  )
}

export async function fetchTeleImportation(params) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.reception.teleImport, params, {
        skipErrorNotify: true,
      })
      return unwrapData(data)
    },
    () => mockFetchTeleImportation(params),
  )
}

export async function listDossiers() {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.reception.dossiers, {
        skipErrorNotify: true,
      })
      const list = unwrapData(data)
      return Array.isArray(list) ? list : []
    },
    () => mockListDossiers(),
  )
}

export async function saveDossier(record) {
  return callApi(
    async () => {
      const { data } = await api.post(ENERGIZER_API.reception.dossiers, record)
      return unwrapData(data)
    },
    () => mockSaveDossier(record),
  )
}

export function todayFr() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export async function fetchPrestationTypes() {
  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.reception.prestationTypes, {
        skipErrorNotify: true,
      })
      const list = unwrapData(data)
      return Array.isArray(list) && list.length ? list : mockPrestationTypes()
    },
    () => mockPrestationTypes(),
  )
}
