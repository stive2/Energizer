import { api } from 'boot/axios'
import { unwrapData } from 'src/modules/energizer/api/callApi.js'
import { getCnpsApiTimeout } from 'src/modules/shared/config/api.js'
import { getApiErrorMessage } from 'src/modules/shared/services/http/apiError.js'
import { isTeleImmatLegacyEnabled } from 'src/modules/shared/config/teleImmat.js'
import {
  parseImmatAssureSubmitResponse,
  stripHtml,
} from './immatAssureResponse.js'
import { teleImmatAxios } from './teleImmatClient.js'

const GERER_EMPLOYEUR_PATH =
  import.meta.env.VITE_CNPS_API_GERER_EMPLOYEUR_PATH || '/immat/gerer-employeur'

const IMMAT_SUBMIT_TIMEOUT_MS = Math.max(getCnpsApiTimeout(), 120_000)

async function postGererEmployeurLegacy(formData) {
  const { data } = await teleImmatAxios.post('/GererEmployeur', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: IMMAT_SUBMIT_TIMEOUT_MS,
    skipErrorNotify: true,
  })
  const parsed = parseImmatAssureSubmitResponse(data)
  if (!parsed.success) {
    throw new Error(stripHtml(parsed.message) || 'Échec de l’enregistrement employeur.')
  }
  return {
    success: true,
    Msg: stripHtml(parsed.message) || 'Enregistrement réussi.',
    codeTele: parsed.codeTele,
    codeSecret: parsed.codeSecret,
  }
}

/**
 * POST multipart — équivalent ../GererEmployeur (tele_imma_employeur1.jsp).
 * @param {FormData} formData
 */
export async function submitGererEmployeur(formData) {
  if (isTeleImmatLegacyEnabled()) {
    try {
      return await postGererEmployeurLegacy(formData)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }

  const { data } = await api.post(GERER_EMPLOYEUR_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: IMMAT_SUBMIT_TIMEOUT_MS,
  })
  return unwrapData(data)
}
