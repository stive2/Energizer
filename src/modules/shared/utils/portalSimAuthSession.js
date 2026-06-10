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
export function persistAgentSession(payload = {}) {
  const existing = readUserInfo() || {}
  const login = payload.login || existing.login || ''
  const prenom = payload.prenom || existing.prenom || ''
  const nom = payload.nom || existing.nom || ''
  const displayName =
    payload.displayName ||
    existing.displayName ||
    [prenom, nom].filter(Boolean).join(' ') ||
    login

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(AGENT_PROFILE_KEY, 'internal')
    sessionStorage.setItem(
      AGENT_NAME_KEY,
      prenom && nom ? `${prenom} ${nom}` : displayName,
    )
  }
  if (typeof localStorage !== 'undefined') {
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token)
    }
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        profile: 'internal',
        login,
        prenom,
        nom,
        displayName,
        email: existing.email || login,
        matricule: existing.matricule || login,
        agence: payload.lib_centre || existing.agence || existing.lib_centre || '',
        lib_centre: payload.lib_centre || existing.lib_centre || '',
        code_centre: payload.code_centre || existing.code_centre || '',
        code_role: existing.code_role || '',
      }),
    )
  }
}

/**
 * @param {{ login: string, displayName?: string, num_assu?: string, token: string, user?: object }} payload
 */
export function persistInsuredSession(payload = {}) {
  const numAssu = payload.num_assu || payload.login || ''
  const displayName = payload.displayName || numAssu

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(ASSURE_PROFILE_KEY, 'external')
    sessionStorage.setItem(ASSURE_NAME_KEY, displayName)
  }
  if (typeof localStorage !== 'undefined') {
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token)
    }
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        profile: 'external',
        login: payload.login || numAssu,
        num_assu: numAssu,
        displayName,
        nom: displayName,
        email: payload.email || payload.login || numAssu,
        numeroAssure: numAssu,
        ...(payload.user || {}),
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
