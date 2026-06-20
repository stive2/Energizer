function normalizeMenuLabel(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const PF_PANEL_HREF_PARTS = [
  'elementsliquidationpf',
  'gestiondesreprises',
  'elementsliquidationaf',
  'periodeactivite',
  'gestionpiecemaintientdroit',
  'statsituationsdossiersparbranche',
]

const PF_PANEL_LABELS = new Set([
  'aperiodiques',
  'saisie des reprises',
  'allocations familliales',
  'allocations familiales',
  'periodes activites',
  'pieces de maintien de droit',
  'statistiques situations dossiers par branche',
])

const PRESTATIONS_INTERNAL_LABELS = new Set([
  'pf',
  'rp',
  'gestion jours feries',
  'traiter dossier',
  'saisie des elements de liquidation',
  'aligner un nouvel enfant',
  'liquidation',
  'saisie dossier',
  ...PF_PANEL_LABELS,
])

function isAccueilMenu(group) {
  return normalizeMenuLabel(group?.label) === 'accueil'
}

function isPrestationsMenu(group) {
  return normalizeMenuLabel(group?.label) === 'prestations'
}

function isGestionDossier(node) {
  return normalizeMenuLabel(node?.label) === 'gestion dossier'
}

function isSuiviDossier(node) {
  return normalizeMenuLabel(node?.label) === 'suivi dossier'
}

function isPfPanelNode(node) {
  const href = String(node?.href || '').toLowerCase()
  const label = normalizeMenuLabel(node?.label)
  if (PF_PANEL_LABELS.has(label)) return true
  return PF_PANEL_HREF_PARTS.some((part) => href.includes(part))
}

function cloneMenuNode(node) {
  return {
    label: node.label,
    href: node.href || '',
    children: (node.children || []).map(cloneMenuNode),
  }
}

function collectAllNodes(node, list = []) {
  list.push({
    label: node.label,
    href: node.href || '',
    children: [],
  })

  for (const child of node.children || []) {
    collectAllNodes(child, list)
  }

  return list
}

function findInPool(pool, label) {
  const target = normalizeMenuLabel(label)
  return pool.find((node) => normalizeMenuLabel(node.label) === target) || null
}

function stripSuiviFromTree(node) {
  const children = []

  for (const child of node.children || []) {
    if (isSuiviDossier(child)) continue
    children.push(stripSuiviFromTree(child))
  }

  return {
    label: node.label,
    href: node.href || '',
    children,
  }
}

function findSuiviDossier(node) {
  if (isSuiviDossier(node)) {
    return cloneMenuNode(node)
  }

  for (const child of node.children || []) {
    const found = findSuiviDossier(child)
    if (found) return found
  }

  return null
}

function flattenChainedChildren(children = []) {
  const flatChildren = []

  for (const child of children) {
    if (child.children?.length) {
      flatChildren.push({
        label: child.label,
        href: child.href || '',
        children: [],
      })

      for (const nested of child.children) {
        flatChildren.push({
          label: nested.label,
          href: nested.href || '',
          children: nested.children || [],
        })
      }
      continue
    }

    flatChildren.push(child)
  }

  return flatChildren
}

function flattenGestionDossier(node) {
  const prepared = (node.children || [])
    .map((child) => stripSuiviFromTree(child))
    .filter((child) => !isSuiviDossier(child))

  return {
    label: node.label,
    href: node.href || '',
    children: flattenChainedChildren(prepared),
  }
}

function normalizeAccueilMenu(accueil) {
  let suivi = findSuiviDossier(accueil)
  const children = []

  for (const child of accueil.children || []) {
    if (isSuiviDossier(child)) {
      if (!suivi) suivi = cloneMenuNode(child)
      continue
    }

    if (isGestionDossier(child)) {
      children.push(flattenGestionDossier(stripSuiviFromTree(child)))
      continue
    }

    children.push(stripSuiviFromTree(child))
  }

  if (suivi && !children.some(isSuiviDossier)) {
    children.push({ ...suivi, children: [] })
  }

  return {
    label: accueil.label,
    href: accueil.href || '',
    children,
  }
}

function stripPrestationsInternalNodes(node) {
  const norm = normalizeMenuLabel(node?.label)
  const href = String(node?.href || '').toLowerCase()

  if (PRESTATIONS_INTERNAL_LABELS.has(norm)) return null
  if (PF_PANEL_HREF_PARTS.some((part) => href.includes(part))) return null
  if (/nlledeclaration\.jsp/.test(href)) return null

  const children = (node.children || [])
    .map((child) => stripPrestationsInternalNodes(child))
    .filter(Boolean)

  return {
    label: node.label,
    href: node.href || '',
    children,
  }
}

function buildPfSaisieElementsGroup(pool) {
  const panels = pool
    .filter(isPfPanelNode)
    .map((node) => ({
      label: node.label,
      href: node.href || '',
      children: [],
    }))

  const saisie = findInPool(pool, 'Saisie des Elements de Liquidation')

  return {
    label: saisie?.label || 'Saisie des Elements de Liquidation',
    href: '',
    children: panels,
  }
}

function buildPfBranch(pool) {
  const pfChildren = []

  for (const label of ['Gestion Jours Feries', 'Traiter Dossier']) {
    const node = findInPool(pool, label)
    if (node) {
      pfChildren.push({ ...node, children: [] })
    }
  }

  pfChildren.push(buildPfSaisieElementsGroup(pool))

  const aligner = findInPool(pool, 'Aligner un Nouvel Enfant')
  if (aligner) {
    pfChildren.push({ ...aligner, children: [] })
  }

  const liquidation = findInPool(pool, 'Liquidation')
  if (liquidation) {
    pfChildren.push({ ...liquidation, children: [] })
  }

  const pf = findInPool(pool, 'PF')

  return {
    label: pf?.label || 'PF',
    href: '',
    children: pfChildren,
  }
}

function buildRpBranch(pool) {
  const rpChildren = []
  const saisieDossier = findInPool(pool, 'Saisie Dossier')
  const nouveauDossierRp = pool.find((node) =>
    /nlledeclaration\.jsp/i.test(String(node.href || '')),
  )

  if (saisieDossier) {
    if (nouveauDossierRp) {
      rpChildren.push({
        label: saisieDossier.label,
        href: '',
        children: [{ ...nouveauDossierRp, children: [] }],
      })
    } else {
      rpChildren.push({ ...saisieDossier, children: [] })
    }
  }

  const rp = findInPool(pool, 'RP')

  return {
    label: rp?.label || 'RP',
    href: '',
    children: rpChildren,
  }
}

function normalizePrestationsMenu(prestations) {
  const pool = collectAllNodes(prestations)
  const pf = buildPfBranch(pool)
  const rp = buildRpBranch(pool)

  const topChildren = (prestations.children || [])
    .map((child) => stripPrestationsInternalNodes(child))
    .filter(Boolean)

  if (!topChildren.some((child) => normalizeMenuLabel(child.label) === 'pf')) {
    topChildren.push(pf)
  }

  if (!topChildren.some((child) => normalizeMenuLabel(child.label) === 'rp')) {
    topChildren.push(rp)
  }

  return {
    label: prestations.label,
    href: prestations.href || '',
    children: topChildren,
  }
}

/**
 * Corrige la hiérarchie affichée pour coller au menu legacy Energizer (stmenu).
 * @param {Array<{ label: string, href?: string, children?: Array }>} groups
 */
export function normalizeLegacyMenuHierarchy(groups) {
  if (!Array.isArray(groups)) return []

  return groups.map((group) => {
    if (isAccueilMenu(group)) return normalizeAccueilMenu(group)
    if (isPrestationsMenu(group)) return normalizePrestationsMenu(group)
    return group
  })
}
