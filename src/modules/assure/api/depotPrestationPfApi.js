import { api } from 'boot/axios'
import { callApi, unwrapData } from 'src/modules/energizer/api/callApi.js'
import { ASSURE_API } from './paths.js'
import { mapEmployeurApiRow, normalizeMatriculeEmployeur } from './depotPrestationPfUtils.js'
import {
  mockLoadAssureContexte,
  mockSubmitDepotPrestationPf,
} from './mocks/depotPrestationPfMocks.js'
import { fictifApiRechercheEmployeurParMatricule } from './mocks/fictifEmployeurDepotPfApi.js'

/** Délai court pour ne pas bloquer l'UI si le serveur CNPS est injoignable. */
const CONTEXTE_API_TIMEOUT_MS = 4000

export async function loadAssureDepotPfContexte() {
  return callApi(
    async () => {
      const { data } = await api.get(ASSURE_API.depotPf.contexte, {
        skipErrorNotify: true,
        timeout: CONTEXTE_API_TIMEOUT_MS,
      })
      return unwrapData(data)
    },
    mockLoadAssureContexte,
  ).catch(() => mockLoadAssureContexte())
}

/**
 * Recherche employeur par matricule — appel API fictif (données de démo CNPS).
 * Ex. 010-1138701-H → CAMEROON TELECOMMUNICATIONS
 */
export async function fetchEmployeurDepotPf(matricule) {
  const mat = normalizeMatriculeEmployeur(matricule)
  const { data } = await fictifApiRechercheEmployeurParMatricule(mat)
  const mapped = mapEmployeurApiRow(data)
  if (!mapped) {
    throw new Error('Employeur non trouvé')
  }
  return mapped
}

export async function submitDepotPrestationPf(formData) {
  return callApi(
    async () => {
      const { data } = await api.post(ASSURE_API.depotPf.dossiers, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return unwrapData(data)
    },
    mockSubmitDepotPrestationPf,
  ).catch(() => mockSubmitDepotPrestationPf())
}
