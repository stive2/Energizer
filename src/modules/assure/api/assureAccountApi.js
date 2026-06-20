import { assureApi } from 'src/modules/shared/services/http/assureHttpClient.js'
import { unwrapData } from 'src/modules/energizer/api/callApi.js'
import { ASSURE_API } from 'src/modules/assure/api/paths.js'

function unwrapAssure(payload) {
  const body = unwrapData(payload)
  if (body && typeof body === 'object' && body.success === false) {
    throw new Error(body.message || 'Échec de l’opération.')
  }
  return body
}

export async function lookupAssureProfile(numAssu) {
  const { data } = await assureApi.get(ASSURE_API.account.profile(numAssu), {
    skipErrorNotify: true,
  })
  return unwrapAssure(data)?.assure ?? unwrapAssure(data)
}

export async function fetchTypesPiece() {
  const { data } = await assureApi.get(ASSURE_API.account.typesPiece, { skipErrorNotify: true })
  const body = unwrapAssure(data)
  return body?.pieces ?? []
}

/**
 * Création ou modification de compte — GererCompte.php
 * @param {object} payload — champs legacy : num_assu, operation, numtelephone, email, numtypepiece, numpiece, debut_validite, fin_validite
 */
export async function registerOrUpdateAssureAccount(payload) {
  const { data } = await assureApi.post(ASSURE_API.account.register, payload)
  return unwrapAssure(data)
}

export async function changeAssureAccountPassword(payload) {
  const { data } = await assureApi.post(ASSURE_API.account.password, payload)
  return unwrapAssure(data)
}
