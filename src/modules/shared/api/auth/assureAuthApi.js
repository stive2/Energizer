/**
 * Authentification assuré — API PHP backend-assure (ConnFile.php legacy).
 */

import { AuthError } from './authApi.js'
import { assureApi } from 'src/modules/shared/services/http/assureHttpClient.js'
import { ASSURE_API } from 'src/modules/assure/api/paths.js'

function unwrapAssureResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new AuthError('Réponse serveur invalide.')
  }
  if (data.success === false) {
    throw new AuthError(data.message || 'Échec de connexion.', data.code || 'AUTH_FAILED')
  }
  return data
}

/**
 * Connexion assuré — POST /auth/login (équivalent ConnFile.php).
 * Mot de passe en clair : le PHP applique treatPwd() comme le legacy.
 */
export async function loginAssureInsured({ login, password }) {
  const numAssu = (login || '').trim()
  if (!numAssu) {
    throw new AuthError('Saisissez votre matricule assuré.')
  }
  if (!password) {
    throw new AuthError('Saisissez votre mot de passe.')
  }

  try {
    const { data } = await assureApi.post(
      ASSURE_API.auth.login,
      { num_assu: numAssu, mot2passe: password },
      { skipErrorNotify: true },
    )
    const body = unwrapAssureResponse(data)
    if (!body.token) {
      throw new AuthError(body.message || 'Identifiant ou mot de passe incorrect.')
    }

    const user = body.user || {}
    const displayName =
      body.displayName || [user.prenom, user.nom].filter(Boolean).join(' ') || numAssu

    return {
      token: body.token,
      user: {
        ...user,
        login: user.num_assu || numAssu,
        num_assu: user.num_assu || numAssu,
        displayName,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        forlink: user.forlink || '',
        profile: 'external',
      },
    }
  } catch (err) {
    if (err instanceof AuthError) throw err
    const msg =
      err?.response?.data?.message || err?.message || 'Impossible de joindre le serveur assuré.'
    throw new AuthError(msg, err?.response?.data?.code || 'NETWORK_ERROR')
  }
}

/**
 * Changement de mot de passe — POST /account/password (RenewRegFile.php).
 */
export async function changeAssurePassword({ num_assu, password, passwordConfirm, mot2passeOld }) {
  const { data } = await assureApi.post(ASSURE_API.account.password, {
    num_assu,
    mot2passe: password,
    mot2passe2: passwordConfirm ?? password,
    mot2passeOld: mot2passeOld ?? '',
  })
  return unwrapAssureResponse(data)
}

export async function logoutAssureInsured() {
  const { data } = await assureApi.post(ASSURE_API.auth.logout, {}, { skipErrorNotify: true })
  return unwrapAssureResponse(data)
}

export async function fetchAssureMe() {
  const { data } = await assureApi.get(ASSURE_API.auth.me, { skipErrorNotify: true })
  return unwrapAssureResponse(data)
}

/**
 * Réactivation / mot de passe oublié — Reactivate.php
 */
export async function reactivateAssureAccount({ num_assu, email, nom, date_naiss }) {
  const { data } = await assureApi.post(
    ASSURE_API.auth.reactivate,
    { num_assu, email, nom, date_naiss },
    { skipErrorNotify: true },
  )
  return unwrapAssureResponse(data)
}
