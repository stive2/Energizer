import { getSimAccountByProfile } from 'src/constants/simPortalAuth.js'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

const AGENT_PROFILE_KEY = 'energizer-portal-sim-profile'
const AGENT_NAME_KEY = 'energizer-portal-sim-display-name'
const ASSURE_PROFILE_KEY = 'assure-sim-profile'
const ASSURE_NAME_KEY = 'assure-sim-display-name'

function readUserInfo() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasAuthToken() {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(TOKEN_KEY)
}

export function isAgentSessionActive() {
  if (!hasAuthToken()) return false
  if (typeof sessionStorage !== 'undefined') {
    if (sessionStorage.getItem(AGENT_PROFILE_KEY) === 'internal') return true
  }
  const user = readUserInfo()
  return user?.profile === 'internal'
}

export function isInsuredSessionActive() {
  if (!hasAuthToken()) return false
  if (typeof sessionStorage !== 'undefined') {
    if (sessionStorage.getItem(ASSURE_PROFILE_KEY) === 'external') return true
  }
  const user = readUserInfo()
  return user?.profile === 'external'
}

/**
 * @param {{ login: string, displayName: string, profile: string, token: string }} payload
 */
export function persistAgentSession(payload) {
  const spec = getSimAccountByProfile('internal')
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(AGENT_PROFILE_KEY, 'internal')
    sessionStorage.setItem(AGENT_NAME_KEY, payload.displayName || spec.displayName)
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, payload.token || `sim-token-internal`)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        profile: 'internal',
        login: payload.login || spec.login,
        nom: payload.displayName || spec.displayName,
        email: payload.login || spec.login,
        matricule: 'AGT-DEMO-001',
        agence: 'Direction générale (démo)',
      }),
    )
  }
}

/**
 * @param {{ login: string, displayName: string, profile: string, token: string }} payload
 */
export function persistInsuredSession(payload) {
  const spec = getSimAccountByProfile('external')
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(ASSURE_PROFILE_KEY, 'external')
    sessionStorage.setItem(ASSURE_NAME_KEY, payload.displayName || spec.displayName)
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, payload.token || `sim-token-external`)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        profile: 'external',
        login: payload.login || spec.login,
        nom: payload.displayName || spec.displayName,
        email: payload.login || spec.login,
        telephone: '+237677123456',
        adresse: 'YAOUNDE, CAMEROUN',
        numeroAssure: '321-1234567-0',
        sexe: 'F',
        mat_interne: 'EMP-2024-001',
      }),
    )
  }
}

export function clearPortalSimSession() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(AGENT_PROFILE_KEY)
    sessionStorage.removeItem(AGENT_NAME_KEY)
    sessionStorage.removeItem(ASSURE_PROFILE_KEY)
    sessionStorage.removeItem(ASSURE_NAME_KEY)
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}
