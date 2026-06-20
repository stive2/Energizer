import { matchesSidebarRoute } from './sidebarRouteMatch.js'

function normalizeMenuEntry(entry) {
  if (entry.type === 'group' || entry.type === 'item') {
    return entry
  }
  if (entry.to) {
    return { ...entry, type: 'item' }
  }
  if (entry.children?.length) {
    return { ...entry, type: 'group' }
  }
  return { ...entry, type: 'item' }
}

function collectMenuLeaves(entries = [], list = []) {
  for (const raw of entries) {
    const entry = normalizeMenuEntry(raw)
    if (entry.type === 'item' && entry.to) {
      list.push(entry)
    }
    if (entry.type === 'group' && entry.children?.length) {
      collectMenuLeaves(entry.children, list)
    }
  }
  return list
}

function firstLeafRoute(entries = []) {
  for (const raw of entries) {
    const entry = normalizeMenuEntry(raw)
    if (entry.type === 'item' && entry.to) {
      return entry.to
    }
    if (entry.type === 'group' && entry.children?.length) {
      const nested = firstLeafRoute(entry.children)
      if (nested) return nested
    }
  }
  return null
}

function groupHasRouteNameChildren(children, routeName, router) {
  if (!router || !routeName) return false
  return collectMenuLeaves(children).some((leaf) => {
    if (!leaf.to) return false
    return router.resolve(leaf.to).name === routeName
  })
}

function isGroupLandingForRoute(children, currentRoute, router) {
  if (!router) return false
  const leaves = collectMenuLeaves(children)
  const sharesName = leaves.some((leaf) => {
    if (!leaf.to) return false
    return router.resolve(leaf.to).name === currentRoute.name
  })
  if (!sharesName) return false
  return !leaves.some((leaf) => leaf.to && matchesSidebarRoute(currentRoute, leaf.to, router))
}

function menuItemMatchesRoute(entry, currentRoute, router) {
  const normalized = normalizeMenuEntry(entry)
  if (normalized.type !== 'item' || !normalized.to) return false
  if (router) {
    return matchesSidebarRoute(currentRoute, normalized.to, router)
  }
  return normalized.to.name === currentRoute.name
}

function findMenuChain(items, currentRoute, router, ancestors = []) {
  for (const raw of items) {
    const entry = normalizeMenuEntry(raw)
    const chain = [...ancestors, entry]

    if (menuItemMatchesRoute(entry, currentRoute, router)) {
      return chain
    }

    if (entry.type === 'group' && entry.children?.length) {
      const found = findMenuChain(entry.children, currentRoute, router, chain)
      if (found) return found

      if (groupHasRouteNameChildren(entry.children, currentRoute.name, router)) {
        if (isGroupLandingForRoute(entry.children, currentRoute, router)) {
          return chain
        }
      }
    }
  }
  return null
}

function resolveCrumbLink(entry, nextEntry) {
  const normalized = normalizeMenuEntry(entry)
  if (normalized.type === 'item' && normalized.to) {
    return normalized.to
  }
  if (normalized.type === 'group') {
    if (nextEntry) {
      const next = normalizeMenuEntry(nextEntry)
      if (next.type === 'item' && next.to) {
        return next.to
      }
      return null
    }
    return firstLeafRoute(normalized.children)
  }
  return null
}

function buildCrumbFromEntry(entry) {
  if (entry.label) {
    return { label: entry.label }
  }
  if (entry.labelKey) {
    return { labelKey: entry.labelKey }
  }
  return { label: '' }
}

/**
 * Construit le fil d'Ariane à partir de la structure du menu sidebar.
 * @param {Array} menuItems
 * @param {import('vue-router').RouteLocationNormalizedLoaded | string} currentRouteOrName
 * @param {{ homeLabelKey?: string, homeRoute?: object, prependHome?: boolean, router?: import('vue-router').Router }} [options]
 * @returns {Array<{ label?: string, labelKey?: string, to?: object }>}
 */
export function buildMenuBreadcrumbs(menuItems, currentRouteOrName, options = {}) {
  const homeLabelKey = options.homeLabelKey ?? 'layout.sidebar.home'
  const homeRoute = options.homeRoute ?? { name: 'energizer-home' }
  const prependHome = options.prependHome !== false
  const router = options.router

  const currentRoute = typeof currentRouteOrName === 'string'
    ? { name: currentRouteOrName, query: {}, path: '', fullPath: '' }
    : currentRouteOrName

  const chain = findMenuChain(menuItems, currentRoute, router)
  if (!chain?.length) {
    return []
  }

  const crumbs = prependHome ? [{ labelKey: homeLabelKey, to: homeRoute }] : []

  chain.forEach((entry, index) => {
    const isLast = index === chain.length - 1
    const crumb = buildCrumbFromEntry(entry)
    if (!isLast) {
      const to = resolveCrumbLink(entry, chain[index + 1])
      if (to) {
        crumb.to = to
      }
    }
    crumbs.push(crumb)
  })

  return crumbs
}
