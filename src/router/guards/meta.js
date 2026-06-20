/**
 * Métadonnées de routes — convention guards Vue Router / Quasar.
 *
 * @typedef {Object} AppRouteMeta
 * @property {boolean} [public] — route accessible sans authentification
 * @property {'internal'|'external'} [guestFor] — page login invité (redirige si déjà connecté)
 * @property {'internal'|'external'} [authProfile] — profil requis (agent CNPS / assuré)
 * @property {boolean} [requiresAuth] — alias : authProfile implicite via parent
 */

/** Routes portail / déclarations — pas de garde auth. */
export const ROUTE_META_PUBLIC = { public: true }

/** Layout agent Energizer + liquidations. */
export const ROUTE_META_AGENT = { authProfile: 'internal' }

/** Layout espace assuré. */
export const ROUTE_META_INSURED = { authProfile: 'external' }

/** Page login agent. */
export const ROUTE_META_GUEST_AGENT = { guestFor: 'internal' }

/** Page login assuré. */
export const ROUTE_META_GUEST_INSURED = { guestFor: 'external' }

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @returns {boolean}
 */
export function routeRequiresAgentAuth(to) {
  return to.matched.some((record) => record.meta.authProfile === 'internal')
}

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @returns {boolean}
 */
export function routeRequiresInsuredAuth(to) {
  return to.matched.some((record) => record.meta.authProfile === 'external')
}

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @returns {boolean}
 */
export function routeIsPublic(to) {
  return to.matched.some((record) => record.meta.public === true)
}
