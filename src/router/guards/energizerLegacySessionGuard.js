import {
  isEnergizerSessionExpiredError,
  probeEnergizerSessionIfNeeded,
} from 'src/modules/energizer/utils/energizerSessionExpiry.js'
import { routeIsPublic, routeRequiresAgentAuth } from './meta.js'

/**
 * Sonde session Tomcat (JSESSIONID) pour les routes agent legacy.
 * @param {import('vue-router').RouteLocationNormalized} to
 * @returns {Promise<true | false>}
 */
export async function energizerLegacySessionGuard(to) {
  if (routeIsPublic(to)) {
    return true
  }
  if (to.meta.guestFor === 'internal') {
    return true
  }
  if (!routeRequiresAgentAuth(to)) {
    return true
  }

  try {
    await probeEnergizerSessionIfNeeded(to)
    return true
  } catch (error) {
    if (isEnergizerSessionExpiredError(error)) {
      return false
    }
    return true
  }
}
