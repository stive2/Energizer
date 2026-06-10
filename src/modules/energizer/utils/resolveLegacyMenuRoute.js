function normalizeLabel(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function pfPanelRoute(panel) {
  return { name: 'prestation-pf-saisie-elements', query: { panel } }
}

/**
 * Associe une entrée du menu legacy Energizer à une route Vue relookée.
 * @param {{ label?: string, href?: string }} entry
 * @returns {{ name: string, query?: Record<string, string> } | null}
 */
export function resolveLegacyMenuRoute(entry = {}) {
  const norm = normalizeLabel(entry.label)
  const href = String(entry.href || '').toLowerCase()

  if (
    /nouveau\s*dossier/.test(norm) ||
    /reception.*nouveau.*dossier/.test(norm) ||
    /nouveaudossier|nouvdossier/.test(href)
  ) {
    return { name: 'energizer-reception-nouveau-dossier' }
  }

  if (/^aperiodiques?$/.test(norm) || /elementsliquidationpf|liquidationpf\/saisie/.test(href)) {
    return pfPanelRoute('aperiodique')
  }

  if (/saisie des reprises|^reprises$/.test(norm) || /gestiondesreprises/.test(href)) {
    return pfPanelRoute('reprises')
  }

  if (/allocations familliales|allocations familiales/.test(norm) || /elementsliquidationaf/.test(href)) {
    return pfPanelRoute('allocations')
  }

  if (/periodes? activites?/.test(norm) || /periodeactivite/.test(href)) {
    return pfPanelRoute('periodeActivite')
  }

  if (/pieces? de maintien/.test(norm) || /gestionpiecemaintientdroit/.test(href)) {
    return pfPanelRoute('pieceMaintien')
  }

  if (/statistiques situations/.test(norm) || /statsituationsdossiersparbranche/.test(href)) {
    return pfPanelRoute('statistiques')
  }

  if (/gestionliquidationrp/.test(href)) {
    return { name: 'gestion-liquidation-rp' }
  }

  if (/nlledeclaration/.test(href)) {
    return { name: 'prestation-rp-saisie-dossier' }
  }

  if (/saisie.*dossier.*rp|saisiedossierrp|saisie-dossier-rp/.test(href + norm)) {
    return { name: 'prestation-rp-saisie-dossier' }
  }

  if (/saisie.*elements.*rp|elementsliquidationrp|saisie-elements-rp/.test(href + norm)) {
    return { name: 'prestation-rp-saisie-elements' }
  }

  if (/pageprincipale\.jsp/.test(href) || (norm === 'accueil' && !href)) {
    return { name: 'energizer-home' }
  }

  return null
}

export function legacyMenuRouteIcon(route) {
  const name = route?.name
  if (name === 'energizer-reception-nouveau-dossier') return 'inbox'
  if (name === 'energizer-home') return 'insights'
  if (String(name || '').includes('prestation-pf')) return 'family_restroom'
  if (String(name || '').includes('prestation-rp')) return 'elderly'
  if (String(name || '').includes('liquidation-rp')) return 'account_balance_wallet'
  return 'article'
}
