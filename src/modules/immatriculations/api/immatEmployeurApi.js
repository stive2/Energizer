import { api } from 'boot/axios'
import { callApi, unwrapData } from 'src/modules/energizer/api/callApi.js'

const GERER_EMPLOYEUR_PATH =
  import.meta.env.VITE_CNPS_API_GERER_EMPLOYEUR_PATH || '/immat/gerer-employeur'

export function mockSubmitGererEmployeur() {
  return Promise.resolve({
    success: true,
    Msg: 'Employeur de main d’œuvre domestique enregistré avec succès.',
  })
}

/**
 * POST multipart — équivalent ../GererEmployeur (tele_imma_employeur0).
 * @param {FormData} formData
 */
export async function submitGererEmployeur(formData) {
  return callApi(
    async () => {
      const { data } = await api.post(GERER_EMPLOYEUR_PATH, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
      })
      return unwrapData(data)
    },
    mockSubmitGererEmployeur,
  ).catch(() => mockSubmitGererEmployeur())
}
