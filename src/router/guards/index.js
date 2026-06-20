import { registerEnergizerSessionRouter } from 'src/modules/energizer/utils/energizerSessionExpiry.js'
import { authProfileGuard } from './authProfileGuard.js'
import { energizerLegacySessionGuard } from './energizerLegacySessionGuard.js'

/** @typedef {import('vue-router').NavigationGuardNext} NavigationGuardNext */

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {import('vue-router').RouteLocationNormalized} from
 * @param {Array<(to: import('vue-router').RouteLocationNormalized, from: import('vue-router').RouteLocationNormalized) => true | import('vue-router').RouteLocationRaw | false | Promise<true | import('vue-router').RouteLocationRaw | false>>} guards
 */
async function runGuardPipeline(to, from, guards) {
  for (const guard of guards) {
    const result = await guard(to, from)
    if (result !== true) {
      return result
    }
  }
  return true
}

const GLOBAL_GUARDS = [
  authProfileGuard,
  energizerLegacySessionGuard,
]

/**
 * Enregistre le pipeline de navigation guards Quasar / Vue Router.
 * @param {import('vue-router').Router} router
 */
export function setupRouterGuards(router) {
  registerEnergizerSessionRouter(router)

  router.beforeEach(async (to, from, next) => {
    const result = await runGuardPipeline(to, from, GLOBAL_GUARDS)

    if (result === true) {
      next()
      return
    }
    if (result === false) {
      next(false)
      return
    }
    next(result)
  })
}

export { authProfileGuard, energizerLegacySessionGuard }
export * from './meta.js'
