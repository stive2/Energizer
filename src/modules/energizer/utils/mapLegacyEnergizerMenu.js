import { isRelocatedToolbarMenuLabel } from 'src/modules/energizer/utils/partitionEnergizerToolbarLinks.js'
import {
  legacyMenuRouteIcon,
  resolveLegacyMenuRoute,
} from 'src/modules/energizer/utils/resolveLegacyMenuRoute.js'

const TOP_GROUP_ICONS = ['apps', 'folder', 'account_tree', 'category', 'work']
const NESTED_GROUP_ICON = 'subdirectory_arrow_right'
const PENDING_ROUTE_ICON = 'article'

/**
 * Convertit le menu #sidebar1 (stmenu) parsé depuis pagePrincipale.jsp
 * vers le format attendu par AppSidebarNav / AuraSidebarNavNode.
 * Les liens backend JSP ne sont pas exposés : route Quasar si mappée, sinon entrée désactivée.
 *
 * @param {Array<{ label: string, children: Array }>} groups
 */
export function mapLegacyMenuGroupsToSidebar(groups) {
  if (!Array.isArray(groups) || !groups.length) return []

  return groups.map((group, index) => mapLegacyGroup(group, index)).filter(Boolean)
}

function mapLegacyGroup(group, index) {
  const children = mapLegacyNodes(group.children || [], 1)
  if (!children.length) {
    return mapLegacyNode(group, 0)
  }

  return {
    type: 'group',
    label: group.label,
    icon: TOP_GROUP_ICONS[index % TOP_GROUP_ICONS.length],
    defaultOpened: false,
    children,
  }
}

function mapLegacyNodes(nodes, depth = 0) {
  if (!Array.isArray(nodes)) return []

  return nodes.map((node) => mapLegacyNode(node, depth)).filter(Boolean)
}

function mapLegacyNode(node, depth = 0) {
  const label = String(node?.label || '').trim()
  if (!label) return null
  if (isRelocatedToolbarMenuLabel(label)) return null

  const href = String(node?.href || '').trim()
  const nestedChildren = Array.isArray(node?.children) ? node.children : []
  const mappedChildren = mapLegacyNodes(nestedChildren, depth + 1)

  if (mappedChildren.length) {
    return {
      type: 'group',
      label,
      icon: NESTED_GROUP_ICON,
      defaultOpened: false,
      children: mappedChildren,
    }
  }

  const route = resolveLegacyMenuRoute({ label, href })
  if (route) {
    const hasPanelQuery = route.query != null && Object.keys(route.query).length > 0
    return {
      type: 'item',
      label,
      to: route,
      icon: legacyMenuRouteIcon(route),
      exact: hasPanelQuery,
    }
  }

  return {
    type: 'item',
    label,
    icon: PENDING_ROUTE_ICON,
    disabled: true,
  }
}
