import { api } from 'boot/axios'
import { getCnpsApiTimeout } from 'src/modules/shared/config/api.js'
import { getApiErrorMessage } from 'src/modules/shared/services/http/apiError.js'
import { ASSURE_API } from 'src/modules/assure/api/paths.js'
import { isTeleImmatLegacyEnabled } from 'src/modules/shared/config/teleImmat.js'
import {
  enrichSubmitCredentials,
  parseImmatAssureSubmitResponse,
} from './immatAssureResponse.js'
import { teleImmatAxios } from './teleImmatClient.js'

const IMMAT_SUBMIT_TIMEOUT_MS = Math.max(getCnpsApiTimeout(), 120_000)

function resolveSubmitUrl() {
  if (isTeleImmatLegacyEnabled()) {
    return '/GererAssure'
  }
  const custom = import.meta.env.VITE_CNPS_API_IMMAT_ASSURE_PATH
  if (custom && String(custom).trim()) {
    return String(custom).trim()
  }
  return ASSURE_API.teleImmat.gererAssure
}

async function postGererAssure(formData) {
  const client = isTeleImmatLegacyEnabled() ? teleImmatAxios : api
  const url = resolveSubmitUrl()
  const { data } = await client.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: IMMAT_SUBMIT_TIMEOUT_MS,
    skipErrorNotify: true,
  })
  const parsed = enrichSubmitCredentials(parseImmatAssureSubmitResponse(data))
  if (!parsed.success) {
    throw new Error(parsed.message)
  }
  if (!parsed.codeTele) {
    throw new Error(
      parsed.message || 'Réponse GererAssure sans code de pré-immatriculation.',
    )
  }
  return parsed
}

/**
 * Soumission multipart (FormData) — équivalent POST ../GererAssure sur teleImmat_0.1.
 * @param {FormData} formData
 */
export async function submitTeleImmatAssure(formData) {
  if (!isTeleImmatLegacyEnabled()) {
    throw new Error(
      'Soumission télé-immatriculation indisponible : définissez VITE_TELE_IMMAT_USE_LEGACY=true.',
    )
  }
  try {
    return await postGererAssure(formData)
  } catch (error) {
    throw new Error(getApiErrorMessage(error))
  }
}
