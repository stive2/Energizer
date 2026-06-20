import { assureApi } from 'src/modules/shared/services/http/assureHttpClient.js'
import { unwrapData } from 'src/modules/energizer/api/callApi.js'
import { ASSURE_API } from './paths.js'

function unwrapAssureHome(payload) {
  const body = unwrapData(payload)
  if (body && typeof body === 'object' && body.success === false) {
    throw new Error(body.message || 'Impossible de charger l’accueil assuré.')
  }
  return body
}

export async function fetchAssureHomeDashboard() {
  const { data } = await assureApi.get(ASSURE_API.home, { skipErrorNotify: true })
  return unwrapAssureHome(data)
}
