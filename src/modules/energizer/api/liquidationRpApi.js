import { api } from 'src/modules/shared/services/http/cnpsHttp.js'

import { ENERGIZER_API } from './paths.js'

import { callApi, unwrapData } from './callApi.js'

import {

  LegacyOperation,

  toLegacyApiPayload,

} from './adapters/energizerLegacyAdapter.js'

import {
  fetchRpEmployeurLegacy,
  fetchRpReferentialsLegacy,
  isRpLegacyApiEnabled,
  saveCertificatDecesLegacy,
  saveCertificatInitLegacy,
  saveRpDeclarationLegacy,
  saveTiersBeneficiaireLegacy,
  fetchTiersBeneficiairesLegacy,
  fetchNotesFraisDossiersLegacy,
  fetchNotesFraisObjetsLegacy,
  saveNoteFraisLegacy,
  searchRpCertificatDossiersLegacy,
  searchRpDossiersLegacy,
} from './liquidationRpLegacyApi.js'

import {
  mockNotesFraisMeta,
  mockSubmitOk,
} from './mocks/rpMocks.js'



export async function fetchRpEmployeur(matricule) {
  if (isRpLegacyApiEnabled()) {
    const row = await fetchRpEmployeurLegacy(matricule)
    if (!row?.nomemployeur && !row?.raison_sociale) {
      throw new Error('Aucun employeur trouvé pour ce matricule.')
    }
    return row
  }

  const mat = String(matricule || '').trim()
  const { data } = await api.get(ENERGIZER_API.rp.employeur, {
    params: { mat },
    skipErrorNotify: true,
  })
  const result = unwrapData(data)
  if (result?.raison_sociale || result?.nomemployeur) return result
  throw new Error('Aucun employeur trouvé pour ce matricule.')
}



export async function searchRpDossiers(params = {}) {
  if (isRpLegacyApiEnabled()) {
    return searchRpDossiersLegacy()
  }

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
    () => [],
  )
}

export async function searchRpCertificatDossiers() {
  if (isRpLegacyApiEnabled()) {
    return searchRpCertificatDossiersLegacy()
  }

  const { data } = await api.get(ENERGIZER_API.rp.dossiers, { skipErrorNotify: true })
  const list = unwrapData(data)
  return Array.isArray(list) ? list : []
}



export async function fetchRpReferentials() {
  if (isRpLegacyApiEnabled()) {
    return fetchRpReferentialsLegacy()
  }
  return {
    arrondissements: [],
    typeRisques: [],
    siegeLesions: [],
    natureLesions: [],
    agentMateriels: [],
    postesTravail: [],
  }
}

export async function saveRpDeclaration(form) {
  if (isRpLegacyApiEnabled()) {
    return saveRpDeclarationLegacy(form)
  }

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
  if (isRpLegacyApiEnabled()) {
    return saveCertificatInitLegacy(form)
  }

  const payload = toLegacyApiPayload(LegacyOperation.RP_CERTIFICAT_INIT, form)
  const { data } = await api.post(ENERGIZER_API.rp.certificatInit, payload)
  return unwrapData(data)
}



export async function saveCertificatDeces(form) {
  if (isRpLegacyApiEnabled()) {
    return saveCertificatDecesLegacy(form)
  }

  const payload = toLegacyApiPayload(LegacyOperation.RP_CERTIFICAT_DECES, form)
  const { data } = await api.post(ENERGIZER_API.rp.certificatDeces, payload)
  return unwrapData(data)
}



export async function saveNoteFrais(form) {
  if (isRpLegacyApiEnabled()) {
    return saveNoteFraisLegacy(form)
  }

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
  if (isRpLegacyApiEnabled()) {
    return fetchNotesFraisDossiersLegacy()
  }

  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.rp.notesFraisDossiers, { skipErrorNotify: true })
      return unwrapData(data)
    },
    () => mockNotesFraisMeta().dossiers,
  )
}

export async function fetchNotesFraisObjets() {
  if (isRpLegacyApiEnabled()) {
    return fetchNotesFraisObjetsLegacy()
  }

  return callApi(
    async () => {
      const { data } = await api.get(ENERGIZER_API.rp.notesFraisObjets, { skipErrorNotify: true })
      return unwrapData(data)
    },
    () => mockNotesFraisMeta().objets,
  )
}



export async function saveTiersBeneficiaire(form) {
  if (isRpLegacyApiEnabled()) {
    return saveTiersBeneficiaireLegacy(form)
  }

  const payload = toLegacyApiPayload(LegacyOperation.RP_TIERS_BENEFICIAIRE, form)
  const { data } = await api.post(ENERGIZER_API.rp.tiersBeneficiaire, payload)
  return unwrapData(data)
}

export async function fetchTiersBeneficiaires(numassu) {
  if (isRpLegacyApiEnabled()) {
    return fetchTiersBeneficiairesLegacy(numassu)
  }

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


