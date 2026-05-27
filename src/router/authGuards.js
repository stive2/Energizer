import { isAgentSessionActive, isInsuredSessionActive } from 'src/modules/shared/utils/portalSimAuthSession.js'

export function setupAuthGuards(router) {
  router.beforeEach((to, _from, next) => {
    const needsAgent = to.matched.some((r) => r.meta.authProfile === 'internal')
    const needsInsured = to.matched.some((r) => r.meta.authProfile === 'external')

    if (to.name === 'energizer-login' && isAgentSessionActive()) {
      next({ name: 'energizer-home' })
      return
    }

    if (to.name === 'assure-login' && isInsuredSessionActive()) {
      next({ name: 'assure-home' })
      return
    }

    if (!needsAgent && !needsInsured) {
      next()
      return
    }

    if (needsAgent && !isAgentSessionActive()) {
      next({ name: 'energizer-login', query: { redirect: to.fullPath } })
      return
    }

    if (needsInsured && !isInsuredSessionActive()) {
      next({ name: 'assure-login', query: { redirect: to.fullPath } })
      return
    }

    next()
  })
}
