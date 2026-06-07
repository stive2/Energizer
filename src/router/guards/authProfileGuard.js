import {
  isAgentSessionActive,
  isInsuredSessionActive,
} from 'src/modules/shared/utils/portalSimAuthSession.js'
import {
  routeIsPublic,
  routeRequiresAgentAuth,
  routeRequiresInsuredAuth,
} from './meta.js'

/**
 * Garde authentification locale (token + profil sessionStorage).
 * @param {import('vue-router').RouteLocationNormalized} to
 * @returns {true | import('vue-router').RouteLocationRaw | false}
 */
export function authProfileGuard(to) {
  if (routeIsPublic(to)) {
    return true
  }

  const guestFor = to.meta.guestFor
  if (guestFor === 'internal') {
    if (isAgentSessionActive()) {
      return { name: 'energizer-home' }
    }
    return true
  }
  if (guestFor === 'external') {
    if (isInsuredSessionActive()) {
      return { name: 'assure-home' }
    }
    return true
  }

  const needsAgent = routeRequiresAgentAuth(to)
  const needsInsured = routeRequiresInsuredAuth(to)

  if (!needsAgent && !needsInsured) {
    return true
  }

  if (needsAgent && !isAgentSessionActive()) {
    return {
      name: 'energizer-login',
      query: { redirect: to.fullPath },
    }
  }

  if (needsInsured && !isInsuredSessionActive()) {
    return {
      name: 'assure-login',
      query: { redirect: to.fullPath },
    }
  }

  return true
}
