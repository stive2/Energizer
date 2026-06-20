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

function rpNouveauDossierRoute() {
  return { name: 'prestation-rp-saisie-dossier', query: { panel: 'nouveauDossier' } }
}

/** Correspondance href servlet → id panel (ordre : plus spécifique en premier). */
const PF_PANEL_BY_HREF = [
  ['elementsliquidationpf', 'aperiodique'],
  ['gestiondesreprises', 'reprises'],
  ['elementsliquidationaf', 'allocations'],
  ['periodeactivite', 'periodeActivite'],
  ['gestionpiecemaintientdroit', 'pieceMaintien'],
  ['statsituationsdossiersparbranche', 'statistiques'],
]

function resolvePfPanelRoute(norm, href) {
  for (const [part, panel] of PF_PANEL_BY_HREF) {
    if (href.includes(part)) {
      return pfPanelRoute(panel)
    }
  }

  if (/^aperiodiques?$/.test(norm)) return pfPanelRoute('aperiodique')
  if (/saisie des reprises|^reprises$/.test(norm)) return pfPanelRoute('reprises')
  if (/allocations familliales|allocations familiales/.test(norm)) {
    return pfPanelRoute('allocations')
  }
  if (/periodes? activites?/.test(norm)) return pfPanelRoute('periodeActivite')
  if (/pieces? de maintien/.test(norm)) return pfPanelRoute('pieceMaintien')
  if (/statistiques situations/.test(norm)) return pfPanelRoute('statistiques')

  return null
}

/**
 * Associe une entrée du menu legacy Energizer à une route Vue relookée.
 * @param {{ label?: string, href?: string }} entry
 * @returns {{ name: string, query?: Record<string, string> } | null}
 */
export function resolveLegacyMenuRoute(entry = {}) {
  const norm = normalizeLabel(entry.label)
  const href = String(entry.href || '').toLowerCase()

  if (/nlledeclaration/.test(href)) {
    return rpNouveauDossierRoute()
  }

  if (
    /nouveau\s*dossier/.test(norm) ||
    /reception.*nouveau.*dossier/.test(norm) ||
    /nouveaudossier|nouvdossier/.test(href)
  ) {
    return { name: 'energizer-reception-nouveau-dossier' }
  }

  const pfRoute = resolvePfPanelRoute(norm, href)
  if (pfRoute) return pfRoute

  if (/gestionliquidationrp/.test(href)) {
    return { name: 'gestion-liquidation-rp' }
  }

  if (/saisie.*dossier.*rp|saisiedossierrp|saisie-dossier-rp/.test(href + norm)) {
    return rpNouveauDossierRoute()
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
