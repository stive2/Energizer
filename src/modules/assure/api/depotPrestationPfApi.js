import { api } from 'boot/axios'
import { unwrapData } from 'src/modules/energizer/api/callApi.js'
import { ASSURE_API } from './paths.js'
import { mapEmployeurApiRow, normalizeMatriculeEmployeur } from './depotPrestationPfUtils.js'

/** Délai court pour ne pas bloquer l'UI si le serveur CNPS est injoignable. */
const CONTEXTE_API_TIMEOUT_MS = 4000

export async function loadAssureDepotPfContexte() {
  const { data } = await api.get(ASSURE_API.depotPf.contexte, {
    skipErrorNotify: true,
    timeout: CONTEXTE_API_TIMEOUT_MS,
  })
  return unwrapData(data)
}

export async function fetchEmployeurDepotPf(matricule) {
  const mat = normalizeMatriculeEmployeur(matricule)
  const { data } = await api.get(ASSURE_API.depotPf.employeur, {
    params: { matricule: mat },
    skipErrorNotify: true,
  })
  const mapped = mapEmployeurApiRow(unwrapData(data))
  if (!mapped) {
    throw new Error('Employeur non trouvé')
  }
  return mapped
}

export async function submitDepotPrestationPf(formData) {
  const { data } = await api.post(ASSURE_API.depotPf.dossiers, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(data)
}
