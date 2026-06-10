/**
 * Authentification portail CNPS.
 *
 * Agent Energizer : auth legacy JSP si `VITE_ENERGIZER_LEGACY_AUTH=true`.
 * Autres profils : API REST `/auth`.
 */

import { api } from 'src/modules/shared/services/http/cnpsHttp.js'

import { unwrapData } from 'src/modules/energizer/api/callApi.js'

import { calcMD5 } from 'src/modules/shared/utils/md5.js'

import { AUTH_API } from './paths.js'
import { isEnergizerLegacyAuthEnabled } from 'src/modules/shared/config/energizerHttp.js'
import { loginEnergizerAgent } from './energizerAuthApi.js'

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

  if (variant === 'agent' && isEnergizerLegacyAuthEnabled()) {
    return loginEnergizerAgent({ login: loginValue, password })
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

export async function forgotPassword({ login: loginValue, variant }) {
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

export async function resetPassword({ token, newPassword }) {
  const hashed = calcMD5(newPassword)

  const { data } = await api.post(
    AUTH_API.resetPassword,
    { token, password: hashed },
    { skipErrorNotify: true },
  )

  return unwrapData(data) || { success: true }
}

export async function logout() {
  try {
    await api.post(AUTH_API.logout, {}, { skipErrorNotify: true })
  } catch {
    /* déconnexion locale prioritaire */
  }
  return { success: true }
}
