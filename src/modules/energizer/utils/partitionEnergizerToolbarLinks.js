export const TOOLBAR_LINK_KIND = {
  PASSWORD: 'password',
  LOGOUT: 'logout',
  LOGIN_HISTORY: 'login_history',
  SITUATION_DOSSIER: 'situation_dossier',
  DOSSIER_EN_LIGNE: 'dossier_en_ligne',
  DOSSIER_PENSION_AUTO: 'dossier_pension_auto',
  DOSSIER_ONBASE: 'dossier_onbase',
  CENTRE: 'centre',
  OTHER: 'other',
}

const DOSSIER_KIND_ORDER = [
  TOOLBAR_LINK_KIND.SITUATION_DOSSIER,
  TOOLBAR_LINK_KIND.DOSSIER_EN_LIGNE,
  TOOLBAR_LINK_KIND.DOSSIER_PENSION_AUTO,
  TOOLBAR_LINK_KIND.DOSSIER_ONBASE,
]

function normalizeLabel(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseToolbarLabelAndBadge(rawLabel) {
  const label = String(rawLabel || '').trim()
  const badgeMatch =
    label.match(/[([]+(\d+)[)\]]\s*$/) || label.match(/[-–]\s*(\d+)\s*$/)
  const badge = badgeMatch ? badgeMatch[1] : null
  const cleanLabel = badge
    ? label
        .replace(/[([]\d+[)\]]\s*$/, '')
        .replace(/[-–]\s*\d+\s*$/, '')
        .trim()
    : label

  return { label: cleanLabel, badge }
}

export function classifyToolbarLink(link) {
  const norm = normalizeLabel(link?.label)
  const href = String(link?.href || '').toLowerCase()

  if (
    /modif.*mot|mot de pass|mot passe|changer.*pass|majpwd|maj.?pwd/.test(norm) ||
    /majpwd/i.test(href)
  ) {
    return TOOLBAR_LINK_KIND.PASSWORD
  }
  if (/deconnect|se deconnecter|logout|deconnexion|quitter/.test(norm)) {
    return TOOLBAR_LINK_KIND.LOGOUT
  }
  if (/historique.*connexion|connexion.*historique|historique des connexions/.test(norm)) {
    return TOOLBAR_LINK_KIND.LOGIN_HISTORY
  }
  if (/situation.*dossier|situations.*dossier/.test(norm)) {
    return TOOLBAR_LINK_KIND.SITUATION_DOSSIER
  }
  if (/dossier.*en.*ligne|dossiers.*en.*ligne/.test(norm)) {
    return TOOLBAR_LINK_KIND.DOSSIER_EN_LIGNE
  }
  if (
    /pension.*auto|auto.*genere|auto.*generee|dossier.*pension.*auto|dossiers.*pension.*auto/.test(
      norm,
    )
  ) {
    return TOOLBAR_LINK_KIND.DOSSIER_PENSION_AUTO
  }
  if (/onbase|on base|dossier.*onbase|dossiers.*onbase/.test(norm)) {
    return TOOLBAR_LINK_KIND.DOSSIER_ONBASE
  }
  if (/^cps[\s-]|^centre\s|^centre cnps|cps yaounde|cps-yaounde/.test(norm)) {
    return TOOLBAR_LINK_KIND.CENTRE
  }

  return TOOLBAR_LINK_KIND.OTHER
}

const RELOCATED_TOOLBAR_KINDS = new Set([
  TOOLBAR_LINK_KIND.PASSWORD,
  TOOLBAR_LINK_KIND.LOGOUT,
  TOOLBAR_LINK_KIND.LOGIN_HISTORY,
  TOOLBAR_LINK_KIND.SITUATION_DOSSIER,
  TOOLBAR_LINK_KIND.DOSSIER_EN_LIGNE,
  TOOLBAR_LINK_KIND.DOSSIER_PENSION_AUTO,
  TOOLBAR_LINK_KIND.DOSSIER_ONBASE,
  TOOLBAR_LINK_KIND.CENTRE,
])

/** Entrées déjà réaffectées (profil, pied de sidebar, bannière) — à exclure du menu principal. */
export function isRelocatedToolbarMenuLabel(label) {
  return RELOCATED_TOOLBAR_KINDS.has(classifyToolbarLink({ label }))
}

/**
 * Répartit les liens header Energizer (pagePrincipale.jsp) selon leur destination UI.
 * @param {Array<{ label: string, href: string }>} links
 */
export function partitionEnergizerToolbarLinks(links = []) {
  const result = {
    loginHistory: null,
    dossiersItems: [],
    centreLabel: '',
    toolbarQuickLinks: [],
  }

  const dossierBuckets = Object.fromEntries(DOSSIER_KIND_ORDER.map((kind) => [kind, null]))

  for (const link of links) {
    const kind = classifyToolbarLink(link)
    const { label, badge: badgeFromLabel } = parseToolbarLabelAndBadge(link.label)
    const badge = link.badge || badgeFromLabel
    const normalized = { ...link, label, badge, kind }

    switch (kind) {
      case TOOLBAR_LINK_KIND.PASSWORD:
      case TOOLBAR_LINK_KIND.LOGOUT:
        break
      case TOOLBAR_LINK_KIND.LOGIN_HISTORY:
        if (!result.loginHistory) result.loginHistory = normalized
        break
      case TOOLBAR_LINK_KIND.SITUATION_DOSSIER:
      case TOOLBAR_LINK_KIND.DOSSIER_EN_LIGNE:
      case TOOLBAR_LINK_KIND.DOSSIER_PENSION_AUTO:
      case TOOLBAR_LINK_KIND.DOSSIER_ONBASE:
        if (!dossierBuckets[kind]) dossierBuckets[kind] = normalized
        break
      case TOOLBAR_LINK_KIND.CENTRE:
        if (!result.centreLabel) result.centreLabel = label
        break
      default:
        result.toolbarQuickLinks.push(normalized)
    }
  }

  result.dossiersItems = DOSSIER_KIND_ORDER.map((kind) => dossierBuckets[kind]).filter(Boolean)

  return result
}
