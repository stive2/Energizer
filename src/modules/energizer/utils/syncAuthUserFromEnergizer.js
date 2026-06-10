import { persistAgentSession } from 'src/modules/shared/utils/portalSimAuthSession.js'

function readAgentLogin() {
  if (typeof localStorage === 'undefined') return ''
  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) return ''
    const user = JSON.parse(raw)
    return user?.profile === 'internal' ? String(user.login || '').trim() : ''
  } catch {
    return ''
  }
}

/**
 * Aligne user_info / libellés affichés avec le HTML pagePrincipale de l'agent connecté.
 * @param {{ firstName?: string, lastName?: string, displayName?: string, lib_centre?: string }} user
 * @param {string} [login]
 */
export function syncAuthUserFromEnergizer(user = {}, login = '') {
  const agentLogin = String(login || readAgentLogin() || '').trim()
  if (!agentLogin || !user) return

  persistAgentSession({
    login: agentLogin,
    displayName: user.displayName || '',
    prenom: user.firstName || '',
    nom: user.lastName || '',
    profile: 'internal',
    lib_centre: user.lib_centre || user.agence || '',
  })
}

export { readAgentLogin }
