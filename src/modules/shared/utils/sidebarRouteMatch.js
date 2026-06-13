/**
 * Correspondance route sidebar — utile quand plusieurs entrées partagent
 * le même path avec des query différentes (?panel=…).
 * @param {import('vue-router').RouteLocationNormalizedLoaded} currentRoute
 * @param {import('vue-router').RouteLocationRaw | undefined} to
 * @param {import('vue-router').Router} router
 */
export function matchesSidebarRoute(currentRoute, to, router) {
  if (!to) return false

  const target = router.resolve(to)
  if (currentRoute.name !== target.name) return false
  if (currentRoute.path !== target.path) return false

  const expectedQuery = typeof to === 'object' && to !== null && !Array.isArray(to) ? to.query : undefined
  if (expectedQuery && Object.keys(expectedQuery).length > 0) {
    return Object.entries(expectedQuery).every(
      ([key, val]) => String(currentRoute.query[key] ?? '') === String(val ?? ''),
    )
  }

  return currentRoute.fullPath === target.fullPath
}

/**
 * @param {{ exact?: boolean, to?: { query?: Record<string, unknown> } }} entry
 */
export function sidebarEntryUsesManualActive(entry) {
  if (entry?.exact != null) return entry.exact
  const query = entry?.to?.query
  return query != null && Object.keys(query).length > 0
}
