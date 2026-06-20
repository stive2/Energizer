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
  if (user?.profile === 'external') {
    repairInsuredSessionMarkers()
    return true
  }
  const numAssu = String(user?.num_assu || user?.login || user?.numeroAssure || '').trim()
  if (numAssu && user?.profile !== 'internal') {
    repairInsuredSessionMarkers()
    return true
  }
  return false
}

/** Aligne sessionStorage sur localStorage après connexion assuré. */
export function repairInsuredSessionMarkers() {
  if (typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return
  if (!hasAuthToken()) return
  const user = readUserInfo()
  if (!user) return
  const numAssu = String(user.num_assu || user.login || user.numeroAssure || '').trim()
  const isExternal =
    user.profile === 'external' || (numAssu && user.profile !== 'internal')
  if (!isExternal) return
  sessionStorage.setItem(ASSURE_PROFILE_KEY, 'external')
  const displayName =
    user.displayName ||
    [user.prenom, user.nom].filter(Boolean).join(' ').trim() ||
    numAssu
  if (displayName) {
    sessionStorage.setItem(ASSURE_NAME_KEY, displayName)
  }
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
  const existing = readUserInfo() || {}
  const apiUser = payload.user && typeof payload.user === 'object' ? payload.user : {}
  const numAssu =
    payload.num_assu ||
    apiUser.num_assu ||
    payload.login ||
    existing.num_assu ||
    existing.login ||
    ''
  const prenom = apiUser.prenom || existing.prenom || ''
  const nom = apiUser.nom || existing.nom || ''
  const displayName =
    payload.displayName ||
    apiUser.displayName ||
    [prenom, nom].filter(Boolean).join(' ') ||
    existing.displayName ||
    numAssu

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
        ...existing,
        ...apiUser,
        profile: 'external',
        login: payload.login || apiUser.login || numAssu || existing.login,
        num_assu: numAssu,
        displayName,
        prenom,
        nom,
        email: apiUser.email || payload.email || existing.email || '',
        numeroAssure: numAssu,
        forlink: apiUser.forlink || existing.forlink || '',
        code_centre: apiUser.code_centre || existing.code_centre || '',
      }),
    )
  }
  repairInsuredSessionMarkers()
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
