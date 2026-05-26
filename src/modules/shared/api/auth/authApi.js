/**

 * Authentification portail CNPS.

 *

 * Par défaut : simulation locale uniquement (`api/auth/simPortalAuth.js`), sans requête HTTP.

 * Quand l'API sera disponible : `VITE_CNPS_USE_REAL_AUTH=true` dans `.env`.

 */

import { api } from 'src/modules/shared/services/http/cnpsHttp.js'

import { unwrapData } from 'src/modules/energizer/api/callApi.js'

import { calcMD5 } from 'src/modules/shared/utils/md5.js'

import { AUTH_API } from './paths.js'

import {

  SIM_PORTAL_EXTERNAL,

  SIM_PORTAL_INTERNAL,

  isSimAuthEnabled,

  validateSimPortalCredentials,

} from 'src/modules/shared/api/auth/simPortalAuth.js'



function variantToProfile(variant) {

  return variant === 'agent' ? 'internal' : 'external'

}



export class AuthError extends Error {

  constructor(message, code = 'AUTH_FAILED') {

    super(message)

    this.name = 'AuthError'

    this.code = code

  }

}



export async function login({ variant, login: loginValue, password }) {

  const profile = variantToProfile(variant)



  if (isSimAuthEnabled()) {

    return mockLogin({ profile, login: loginValue, password })

  }



  const hashed = calcMD5(password)

  const { data } = await api.post(

    AUTH_API.login,

    {

      login: (loginValue || '').trim(),

      password: hashed,

      profile,

    },

    { skipErrorNotify: true },

  )

  const body = unwrapData(data) || {}

  if (!body.token) {

    throw new AuthError(

      body.message || 'Identifiant ou mot de passe incorrect.',

      body.code || 'AUTH_FAILED',

    )

  }

  return {

    token: body.token,

    user: {

      login: body.login || loginValue,

      displayName: body.displayName || body.nom || loginValue,

      profile,

      ...(body.user || {}),

    },

  }

}



function mockLogin({ profile, login: loginValue, password }) {

  const ok = validateSimPortalCredentials(profile, loginValue, password)

  if (!ok) {

    throw new AuthError(

      'Identifiant ou mot de passe incorrect pour ce profil.',

      'INVALID_CREDENTIALS',

    )

  }

  const spec = profile === 'external' ? SIM_PORTAL_EXTERNAL : SIM_PORTAL_INTERNAL

  return {

    token: `sim-token-${profile}-${Date.now()}`,

    user: {

      login: spec.login,

      displayName: spec.displayName,

      profile,

    },

  }

}



export async function forgotPassword({ login: loginValue, variant }) {

  if (isSimAuthEnabled()) {

    return mockForgotPassword(loginValue)

  }



  const profile = variant ? variantToProfile(variant) : undefined

  const { data } = await api.post(

    AUTH_API.forgotPassword,

    { login: (loginValue || '').trim(), profile },

    { skipErrorNotify: true },

  )

  const body = unwrapData(data) || {}

  return {

    success: body.success !== false,

    message:

      body.message ||

      `Un email avec les instructions de réinitialisation a été envoyé à ${loginValue}.`,

  }

}



async function mockForgotPassword(loginValue) {

  await new Promise((resolve) => setTimeout(resolve, 400))

  return {

    success: true,

    message: `Si un compte existe pour « ${loginValue} », un email a été envoyé avec les instructions de réinitialisation.`,

  }

}



export async function resetPassword({ token, newPassword }) {

  if (isSimAuthEnabled()) {

    return Promise.resolve({ success: true })

  }



  const hashed = calcMD5(newPassword)

  const { data } = await api.post(

    AUTH_API.resetPassword,

    { token, password: hashed },

    { skipErrorNotify: true },

  )

  return unwrapData(data) || { success: true }

}



export async function logout() {

  if (isSimAuthEnabled()) {

    return Promise.resolve({ success: true })

  }



  await api.post(AUTH_API.logout, {}, { skipErrorNotify: true })

  return { success: true }

}


