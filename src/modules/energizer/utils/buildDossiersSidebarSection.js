import { parseToolbarLabelAndBadge } from 'src/modules/energizer/utils/partitionEnergizerToolbarLinks.js'

function toSidebarDossierItem(item, resolveHref) {
  const { label, badge } = parseToolbarLabelAndBadge(item.label)

  return {
    type: 'item',
    label,
    href: resolveHref(item.href),
    icon: 'description',
    badge: badge || item.badge || undefined,
  }
}

/**
 * Bloc « Dossiers » séparé en bas de la sidebar (liens header legacy Energizer).
 * @returns {Array} entrées pour AppSidebarNav (groupe unique ou vide)
 */
export function buildDossiersSidebarSection(dossiersItems, resolveHref) {
  if (!Array.isArray(dossiersItems) || !dossiersItems.length) {
    return []
  }

  return [
    {
      type: 'group',
      labelKey: 'layout.energizer.toolbarDossiers',
      icon: 'folder_copy',
      defaultOpened: false,
      children: dossiersItems.map((item) => toSidebarDossierItem(item, resolveHref)),
    },
  ]
}
