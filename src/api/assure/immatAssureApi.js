import { api } from 'boot/axios'
import { callApi } from 'src/api/energizer/callApi.js'
import { getCnpsApiTimeout } from 'src/config/api.js'
import { getApiErrorMessage } from 'src/services/http/apiError.js'
import { ASSURE_API } from './paths.js'
import { parseImmatAssureSubmitResponse } from './immatAssureResponse.js'
import { mockSubmitTeleImmatAssure } from './mocks/immatAssureMocks.js'

const IMMAT_SUBMIT_TIMEOUT_MS = Math.max(getCnpsApiTimeout(), 120_000)

function resolveSubmitUrl() {
  const custom = import.meta.env.VITE_CNPS_API_IMMAT_ASSURE_PATH
  if (custom && String(custom).trim()) {
    return String(custom).trim()
  }
  return ASSURE_API.teleImmat.gererAssure
}

/**
 * Soumission multipart (FormData) — équivalent POST ../GererAssure.
 * Les noms de champs sont ceux produits par buildLegacyFormData / buildLegacyFormDataVol.
 * @param {FormData} formData
 * @returns {Promise<{ success: boolean, message: string, nextPage?: string|null }>}
 */
export async function submitTeleImmatAssure(formData) {
  return callApi(
    async () => {
      const { data } = await api.post(resolveSubmitUrl(), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: IMMAT_SUBMIT_TIMEOUT_MS,
        skipErrorNotify: true,
      })

      const parsed = parseImmatAssureSubmitResponse(data)
      if (!parsed.success) {
        throw new Error(parsed.message)
      }
      return parsed
    },
    mockSubmitTeleImmatAssure,
  ).catch((error) => {
    if (import.meta.env.VITE_CNPS_API_FALLBACK_MOCK === 'true') {
      return mockSubmitTeleImmatAssure()
    }
    throw new Error(getApiErrorMessage(error))
  })
}
