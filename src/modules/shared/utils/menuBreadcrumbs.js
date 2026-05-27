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

function findMenuChain(items, routeName, ancestors = []) {
  for (const raw of items) {
    const entry = normalizeMenuEntry(raw)
    const chain = [...ancestors, entry]

    if (entry.type === 'item' && entry.to?.name === routeName) {
      return chain
    }
    if (entry.type === 'group' && entry.children?.length) {
      const found = findMenuChain(entry.children, routeName, chain)
      if (found) return found
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
      if (next.type === 'group') {
        return firstLeafRoute(next.children)
      }
    }
    return firstLeafRoute(normalized.children)
  }
  return null
}

/**
 * Construit le fil d'Ariane à partir de la structure du menu sidebar.
 * @param {Array} menuItems
 * @param {string} routeName
 * @param {{ homeLabelKey?: string, homeRoute?: object }} [options]
 * @returns {Array<{ labelKey: string, to?: object }>}
 */
export function buildMenuBreadcrumbs(menuItems, routeName, options = {}) {
  const homeLabelKey = options.homeLabelKey ?? 'layout.sidebar.home'
  const homeRoute = options.homeRoute ?? { name: 'energizer-home' }

  const chain = findMenuChain(menuItems, routeName)
  if (!chain?.length) {
    return []
  }

  const crumbs = [{ labelKey: homeLabelKey, to: homeRoute }]

  chain.forEach((entry, index) => {
    const isLast = index === chain.length - 1
    const crumb = { labelKey: entry.labelKey }
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
